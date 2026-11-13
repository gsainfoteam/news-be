import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { toHttpException } from '@infoteam/account-nest';
import { AccountService } from './account';
import { LoginDto } from './dto/req/login.dto';
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
    private readonly accountService: AccountService,
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

  async login(body: LoginDto): Promise<JwtTokenType> {
    const { user: idpUser } = await this.accountService
      .loginWithCode({
        code: body.code,
        codeVerifier: body.code_verifier,
        redirectUri: body.redirect_uri,
        nonce: body.nonce,
        iss: body.iss,
      })
      .catch(toHttpException);
    await this.authRepository.deleteExpiredRefreshTokens(idpUser.sub);

    const user = await this.authRepository.upsertUser(idpUser);
    if (user.termsAgreedAt === null || user.privacyAgreedAt === null)
      throw new ForbiddenException({
        error: 'session_rejected',
        ticket: this.jwtService.sign(
          {},
          {
            subject: user.id,
            secret: this.jwtTempSecret,
            expiresIn: '5m',
          },
        ),
        details: { reason: 'consent_required' },
      });

    return await this.issueTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<JwtTokenType> {
    const hashedToken = this.hashToken(refreshToken);
    const tokenRecord = await this.authRepository
      .deleteRefreshToken(hashedToken)
      .catch((error: unknown) => {
        if (error instanceof NotFoundException) return null;
        throw error;
      });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    return await this.issueTokens(tokenRecord.userId, tokenRecord.expiresAt);
  }

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    await this.authRepository
      .deleteRefreshToken(hashedToken)
      .catch((error: unknown) => {
        if (!(error instanceof NotFoundException)) throw error;
      });
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
