import { DrizzleService, existOrThrow } from '@lib/drizzle';
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
  SELECT *
  FROM user
  WHERE id = id;
  */
  async findUserById(id: string) {
    return await this.drizzleService.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .then(existOrThrow('User not found'));
  }
}
