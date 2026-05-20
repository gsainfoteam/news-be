import { DrizzleService, existOrThrow, UserEntity } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { user } from 'drizzle/schema';

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
      })
      .where(eq(user.id, id));
  }

  /*
  UPDATE "user"
  SET nickname = nickname
  WHERE id = id;
  */
  async updateNickname(id: string, nickname: string): Promise<void> {
    await this.drizzleService.db
      .update(user)
      .set({ nickname })
      .where(eq(user.id, id));
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
