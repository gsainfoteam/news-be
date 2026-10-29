import { Loggable } from '@lib/logger';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { setTimeout } from 'timers/promises';

@Loggable()
@Injectable()
export class StibeeService {
  private readonly AUTO_EMAIL_INTERVAL_MS = 350;
  private autoEmailQueue: Promise<unknown> = Promise.resolve();
  private readonly apiUrl: string;
  private readonly listId: string;
  private readonly autoEmailUrl: string;
  private readonly headers: { AccessToken: string };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('STIBEE_API_URL');
    this.listId = this.configService.getOrThrow<string>('STIBEE_LIST_ID');
    this.autoEmailUrl = this.configService.getOrThrow<string>(
      'STIBEE_AUTO_EMAIL_URL',
    );
    this.headers = {
      AccessToken: this.configService.getOrThrow<string>('STIBEE_API_KEY'),
    };
  }

  // 이미 있는 구독자면 subscribed로 되돌린다 (스티비에서 수신거부했다가 다시 구독하는 경우)
  async addSubscriber(email: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/lists/${this.listId}/subscribers`,
        { subscriber: { email, status: 'subscribed' }, updateEnabled: true },
        { headers: this.headers },
      ),
    );
  }

  async deleteSubscriber(email: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.apiUrl}/lists/${this.listId}/subscribers`,
        { data: { subscribers: [email] }, headers: this.headers },
      ),
    );
  }

  // 200은 접수, 실제 발송 결과는 스티비 이메일 통계에서
  // TODO: 발신자(editor@gist.ac.kr) 도메인에 스티비 DKIM이 없어 "확인되지 않은 보낸 사람" 경고가 뜸, 학교 전산팀에 DKIM 레코드 추가 요청 필요
  async sendAutoEmail(
    email: string,
    fields: Record<string, string>,
  ): Promise<void> {
    const send = this.autoEmailQueue.then(() =>
      firstValueFrom(
        this.httpService.post(
          this.autoEmailUrl,
          { ...fields, subscriber: email },
          { headers: this.headers },
        ),
      ),
    );
    this.autoEmailQueue = send
      .catch(() => undefined)
      .then(() => setTimeout(this.AUTO_EMAIL_INTERVAL_MS));
    await send;
  }
}
