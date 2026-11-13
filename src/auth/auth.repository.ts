import { Injectable, Logger } from '@nestjs/common';
import {
  DrizzleService,
  RefreshTokenEntity,
  UserEntity,
  existOrThrow,
} from '@lib/drizzle';
import { refreshToken, user } from '../../drizzle/schema';
import { and, eq, gte, lt } from 'drizzle-orm';
import { Loggable } from '@lib/logger';

type IdpUser = { sub: string; email: string; name: string; picture?: string };

@Loggable()
@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  INSERT INTO "user" (id, email, name, picture)
  VALUES (idpUser.sub, idpUser.email, idpUser.name, idpUser.picture)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    picture = EXCLUDED.picture,
    updated_at = NOW();
  */
  async upsertUser(idpUser: IdpUser): Promise<UserEntity> {
    return await this.drizzleService.db
      .insert(user)
      .values({
        id: idpUser.sub,
        email: idpUser.email,
        name: idpUser.name,
        picture: idpUser.picture,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          email: idpUser.email,
          name: idpUser.name,
          picture: idpUser.picture,
          updatedAt: new Date(),
        },
      })
      .returning()
      .then(existOrThrow('Failed to upsert user'));
  }

  /*
  INSERT INTO refresh_token (user_id, token, expires_at)
  VALUES (userId, token, expiresAt);
  */
  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.drizzleService.db.insert(refreshToken).values({
      userId,
      token,
      expiresAt,
    });
  }

  /*
  SELECT *
  FROM refresh_token
  WHERE token = token AND expires_at >= NOW()
  LIMIT 1;
  */
  async findRefreshToken(token: string): Promise<RefreshTokenEntity> {
    return await this.drizzleService.db
      .select()
      .from(refreshToken)
      .where(
        and(
          eq(refreshToken.token, token),
          gte(refreshToken.expiresAt, new Date()),
        ),
      )
      .limit(1)
      .then(existOrThrow('Refresh token is invalid or expired'));
  }

  /*
  DELETE FROM refresh_token
  WHERE token = token;
  */
  async deleteRefreshToken(token: string): Promise<RefreshTokenEntity> {
    return await this.drizzleService.db
      .delete(refreshToken)
      .where(eq(refreshToken.token, token))
      .returning()
      .then(existOrThrow('Refresh token is invalid'));
  }

  /*
  DELETE FROM refresh_token
  WHERE user_id = 'userId' AND expires_at < NOW();
  */
  async deleteExpiredRefreshTokens(userId: string): Promise<void> {
    await this.drizzleService.db
      .delete(refreshToken)
      .where(
        and(
          eq(refreshToken.userId, userId),
          lt(refreshToken.expiresAt, new Date()),
        ),
      );
  }
}
