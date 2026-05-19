import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InfoteamAccountUserInfoResponse } from './types/infoteam-account.type';
import { UserInfo } from './types/user-info.type';
import { createPublicKey } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InfoteamAccountService implements OnModuleInit {
  private readonly logger = new Logger(InfoteamAccountService.name);
  private readonly infoteamAccountApiUrl: string;
  private infoteamAccountPubKey!: Buffer;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    this.infoteamAccountApiUrl = configService.getOrThrow<string>(
      'INFOTEAM_ACCOUNT_API_URL',
    );
  }

  async onModuleInit() {
    this.infoteamAccountPubKey = await this.getPublicKey();
  }

  async getUserInfo(idToken: string): Promise<UserInfo> {
    const payload = await this.jwtService
      .verifyAsync<InfoteamAccountUserInfoResponse>(idToken, {
        publicKey: this.infoteamAccountPubKey,
      })
      .catch((err) => {
        this.logger.error('Failed to verify ID token', err);
        throw err;
      });
    const { sub: uuid, name, email, profile } = payload;
    return { uuid, name, email, profile };
  }

  private async getPublicKey(): Promise<Buffer> {
    this.logger.log('Fetching Infoteam Account public key...');
    const url = `${this.infoteamAccountApiUrl}/certs`;
    const response = await firstValueFrom(
      this.httpService.get<{
        keys: {
          kty: string;
          x: string;
          y: string;
          crv: string;
          kid: string;
          use: string;
          alg: string;
        }[];
      }>(url),
    );
    const key = response.data.keys[0];
    const publicKey = createPublicKey({
      key: {
        kty: key.kty,
        crv: key.crv,
        x: key.x,
        y: key.y,
      },
      format: 'jwk',
    });

    return Buffer.from(publicKey.export({ type: 'spki', format: 'pem' }));
  }
}
