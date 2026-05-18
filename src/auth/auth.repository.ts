import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@lib/drizzle';
import { UserInfo } from '@lib/infoteam-account';
import { user } from '../../drizzle/schema';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  async upsertUser(userInfo: UserInfo): Promise<void> {
    await this.drizzleService.db
      .insert(user)
      .values({
        id: userInfo.uuid,
        email: userInfo.email,
        name: userInfo.name,
        profile: userInfo.profile,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          email: userInfo.email,
          name: userInfo.name,
          profile: userInfo.profile,
          updatedAt: new Date(),
        },
      });
  }
}
