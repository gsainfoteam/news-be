import { Injectable, Logger } from '@nestjs/common';
import { InfoteamAccountUserInfoResponse } from './types/infoteam-account.type';
import { UserInfo } from './types/user-info.type';

@Injectable()
export class InfoteamAccountService {
  private readonly logger = new Logger(InfoteamAccountService.name);

  getUserInfo(idToken: string): UserInfo {
    const payloadBase64 = idToken.split('.')[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as InfoteamAccountUserInfoResponse;

    const { sub: uuid, name, email, profile } = payload;

    return { uuid, name, email, profile };
  }
}
