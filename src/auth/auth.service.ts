import { InfoteamAccountService } from '@lib/infoteam-account';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtTokenType } from './types/jwtToken.type';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly infoteamAccountService: InfoteamAccountService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async userLogin(auth: string): Promise<JwtTokenType> {
    const token = auth.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    const userinfo = this.infoteamAccountService.getUserInfo(token);

    await this.authRepository.upsertUser(userinfo);

    return this.issueTokens(userinfo.uuid);
  }

  private issueTokens(uuid: string): JwtTokenType {
    const refresh_token = crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+//=]/g, '');
    return {
      access_token: this.jwtService.sign({}, { subject: uuid }),
      refresh_token,
    };
  }
}
