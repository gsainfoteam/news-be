import { Loggable } from '@lib/logger';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

const API_URL = 'https://api.github.com';
const FRONTEND_DEPLOY_WORKFLOW =
  '/repos/gsainfoteam/news-fe/actions/workflows/production.yml/dispatches';

@Loggable()
@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly app?: {
    id: string;
    installationId: string;
    privateKey: string;
  };

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    const id = configService.get<string>('GITHUB_APP_ID');
    const installationId = configService.get<string>(
      'GITHUB_APP_INSTALLATION_ID',
    );
    const privateKey = configService.get<string>('GITHUB_APP_PRIVATE_KEY');
    // prod에만 앱 값을 넣는다, staging 프론트는 main 푸시로 빌드됨
    if (id && installationId && privateKey) {
      this.app = {
        id,
        installationId,
        // 한 줄 env로 넣은 PEM의 \n을 실제 줄바꿈으로 되돌린다
        privateKey: privateKey.replaceAll('\\n', '\n'),
      };
    }
  }

  // 실패해도 원래 요청은 성공시킨다
  triggerFrontendDeploy(): void {
    if (!this.app) return;
    this.dispatchFrontendDeploy(this.app).catch((error) =>
      this.logger.error(`failed to trigger frontend deploy: ${error}`),
    );
  }

  private async dispatchFrontendDeploy(
    app: NonNullable<GithubService['app']>,
  ): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    // GitHub 권장대로 시계 오차를 감안해 iat를 60초 앞당기고 만료는 10분 이내로
    const appToken = this.jwtService.sign(
      { iat: now - 60, exp: now + 540, iss: app.id },
      { algorithm: 'RS256', privateKey: app.privateKey },
    );
    const { data } = await firstValueFrom(
      this.httpService.post<{ token: string }>(
        `${API_URL}/app/installations/${app.installationId}/access_tokens`,
        undefined,
        { headers: this.headers(appToken) },
      ),
    );
    await firstValueFrom(
      this.httpService.post(
        `${API_URL}${FRONTEND_DEPLOY_WORKFLOW}`,
        { ref: 'main' },
        { headers: this.headers(data.token) },
      ),
    );
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }
}
