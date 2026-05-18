import { InfoteamAccountService } from '@lib/infoteam-account';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtTokenType } from './types/jwt-token.type';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpire: number;

  constructor(
    private readonly infoteamAccountService: InfoteamAccountService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenSecret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );
    this.refreshTokenExpire = ms(
      this.configService.getOrThrow<StringValue>('REFRESH_TOKEN_EXPIRE'),
    );
  }

  async login(auth: string): Promise<JwtTokenType> {
    const token = auth.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    const userinfo = this.infoteamAccountService.getUserInfo(token);

    await this.authRepository.upsertUser(userinfo);
    await this.authRepository.deleteExpiredRefreshTokens(userinfo.uuid);

    return await this.issueTokens(userinfo.uuid);
  }

  async refresh(refreshToken: string): Promise<JwtTokenType> {
    const hashedToken = this.hashToken(refreshToken);
    const tokenRecord =
      await this.authRepository.deleteRefreshToken(hashedToken);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    return await this.issueTokens(tokenRecord.userId, tokenRecord.expiresAt);
  }

  private async issueTokens(
    uuid: string,
    refreshTokenExpiresAt?: Date,
  ): Promise<JwtTokenType> {
    const refresh_token = crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+//=]/g, '');
    const expiresAt =
      refreshTokenExpiresAt ?? new Date(Date.now() + this.refreshTokenExpire);
    await this.authRepository.createRefreshToken(
      uuid,
      this.hashToken(refresh_token),
      expiresAt,
    );
    return {
      access_token: this.jwtService.sign({}, { subject: uuid }),
      refresh_token,
      expiresAt,
    };
  }

  private hashToken(token: string): string {
    return crypto
      .createHmac('sha256', this.refreshTokenSecret)
      .update(token)
      .digest('hex');
  }
}
