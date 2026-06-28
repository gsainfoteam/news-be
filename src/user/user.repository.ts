import { DrizzleService, existOrThrow, UserEntity } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { Injectable, Logger } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { user } from 'drizzle/schema';
import { UpdateConsentDto } from './dto/req/update-consent.dto';

@Loggable()
@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  UPDATE "user"
  SET nickname = nickname, terms_agreed_at = NOW(), privacy_agreed_at = NOW()
  WHERE id = id;
  */
  async registerUser(id: string, nickname?: string): Promise<void> {
    await this.drizzleService.db
      .update(user)
      .set({
        nickname,
        termsAgreedAt: new Date(),
        privacyAgreedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning()
      .then(existOrThrow('User not found'));
  }

  /*
  UPDATE "user"
  SET terms_agreed_at = NOW(), privacy_agreed_at = NOW()
  WHERE id = id;
  */
  async updateConsent(
    id: string,
    { isTermsAgreed, isPrivacyAgreed }: UpdateConsentDto,
  ): Promise<void> {
    await this.drizzleService.db
      .update(user)
      .set({
        ...(isTermsAgreed && {
          termsAgreedAt: new Date(),
        }),
        ...(isPrivacyAgreed && {
          privacyAgreedAt: new Date(),
        }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning()
      .then(existOrThrow('User not found'));
  }

  /*
  UPDATE "user"
  SET nickname = nickname
  WHERE id = id;
  */
  async updateNickname(id: string, nickname: string): Promise<void> {
    await this.drizzleService.db
      .update(user)
      .set({ nickname, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning()
      .then(existOrThrow('User not found'));
  }

  /*
  SELECT *
  FROM user
  WHERE id = id;
  */
  async findUserById(id: string): Promise<UserEntity> {
    return await this.drizzleService.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .then(existOrThrow('User not found'));
  }
}
