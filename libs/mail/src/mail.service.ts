import { Loggable } from '@lib/logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Loggable()
@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.getOrThrow<string>('EMAIL_USER');
    this.transporter = createTransport(
      {
        host: this.configService.getOrThrow<string>('EMAIL_HOST'),
        port: this.configService.getOrThrow<number>('EMAIL_PORT'),
        secure: true,
        auth: {
          type: 'oauth2',
          user,
          serviceClient: this.configService.getOrThrow<string>(
            'EMAIL_SERVICE_CLIENT',
          ),
          privateKey: this.configService
            .getOrThrow<string>('EMAIL_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
          accessUrl: this.configService.getOrThrow<string>('EMAIL_ACCESS_URL'),
        },
      },
      { from: `지스트신문 <${user}>` },
    );
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({ to, subject, html });
  }
}
