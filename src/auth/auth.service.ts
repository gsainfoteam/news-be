import { InfoteamAccountService } from '@lib/infoteam-account';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTokenType } from './types/jwt-token.type';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Loggable } from '@lib/logger';

@Loggable()
@Injectable()
export class AuthService {
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpire: number;
  private readonly jwtTempSecret: string;

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
    this.jwtTempSecret =
      this.configService.getOrThrow<string>('JWT_TEMP_SECRET');
  }

  async login(auth: string): Promise<JwtTokenType> {
    const token = auth.split(' ')[1];
    if (!token) throw new UnauthorizedException();
    const userinfo = await this.infoteamAccountService.getUserInfo(token);
    await this.authRepository.deleteExpiredRefreshTokens(userinfo.uuid);

    const user = await this.authRepository.upsertUser(userinfo);
    if (user.termsAgreedAt === null || user.privacyAgreedAt === null)
      return {
        tempToken: this.jwtService.sign(
          {},
          {
            subject: userinfo.uuid,
            secret: this.jwtTempSecret,
            expiresIn: '5m',
          },
        ),
      };

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

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    await this.authRepository.deleteRefreshToken(hashedToken);
  }

  async issueTokens(
    uuid: string,
    refreshTokenExpiresAt?: Date,
  ): Promise<JwtTokenType> {
    const refreshToken = crypto.randomBytes(32).toString('base64url');
    const expiresAt =
      refreshTokenExpiresAt ?? new Date(Date.now() + this.refreshTokenExpire);
    await this.authRepository.createRefreshToken(
      uuid,
      this.hashToken(refreshToken),
      expiresAt,
    );
    return {
      accessToken: this.jwtService.sign({}, { subject: uuid }),
      refreshToken,
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
