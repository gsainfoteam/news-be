import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  // InternalServerErrorException,
  Logger,
  // UnauthorizedException,
} from '@nestjs/common';
import { InfoteamAccountUserInfoResponse } from './types/infoteam-account.type';
// import { catchError, firstValueFrom } from 'rxjs';
// import { AxiosError } from 'axios';
import { UserInfo } from './types/userInfo.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InfoteamAccountService {
  private readonly logger = new Logger(InfoteamAccountService.name, {
    timestamp: true,
  });
  // private readonly infoteamAccountUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // this.infoteamAccountUrl = this.configService.getOrThrow<string>(
    //   'INFOTEAM_ACCOUNT_URL',
    // );
  }

  getUserInfo(idToken: string): UserInfo {
    // const userInfoResponse = await firstValueFrom(
    //   this.httpService
    //     .get<InfoteamAccountUserInfoResponse>(
    //       this.infoteamAccountUrl + '/userinfo',
    //       {
    //         headers: {
    //           Authorization: `Bearer ${idToken}`,
    //         },
    //       },
    //     )
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         if (error instanceof AxiosError && error.response?.status === 401) {
    //           this.logger.debug('Invalid refresh token');
    //           throw new UnauthorizedException();
    //         }
    //         this.logger.error(error.message);
    //         throw new InternalServerErrorException();
    //       }),
    //     ),
    // );
    // const { sub: uuid, name, email, profile } = userInfoResponse.data;

    const payloadBase64 = idToken.split('.')[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as InfoteamAccountUserInfoResponse;

    const { sub: uuid, name, email, profile } = payload;

    return { uuid, name, email, profile };
  }
}
