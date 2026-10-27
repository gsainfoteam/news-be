import { Category, DrizzleService } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { categorySubscription, user } from 'drizzle/schema';

@Loggable()
@Injectable()
export class SubscriptionRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  SELECT category
  FROM category_subscription
  WHERE user_id = userId;
  */
  async findSubscriptions(userId: string): Promise<Category[]> {
    const rows = await this.drizzleService.db
      .select({ category: categorySubscription.category })
      .from(categorySubscription)
      .where(eq(categorySubscription.userId, userId));
    return rows.map(({ category }) => category);
  }

  /*
  INSERT INTO category_subscription (user_id, category)
  VALUES (userId, category)
  ON CONFLICT DO NOTHING;
  */
  async subscribe(userId: string, category: Category): Promise<void> {
    await this.drizzleService.db
      .insert(categorySubscription)
      .values({ userId, category })
      .onConflictDoNothing();
  }

  /*
  DELETE FROM category_subscription
  WHERE user_id = userId AND category = category;
  */
  async unsubscribe(userId: string, category: Category): Promise<void> {
    await this.drizzleService.db
      .delete(categorySubscription)
      .where(
        and(
          eq(categorySubscription.userId, userId),
          eq(categorySubscription.category, category),
        ),
      );
  }

  /*
  SELECT u.email, cs.category
  FROM category_subscription cs
  JOIN "user" u ON u.id = cs.user_id
  WHERE cs.category IN (categories);
  */
  async findSubscribers(
    categories: Category[],
  ): Promise<{ email: string; category: Category }[]> {
    return await this.drizzleService.db
      .select({ email: user.email, category: categorySubscription.category })
      .from(categorySubscription)
      .innerJoin(user, eq(user.id, categorySubscription.userId))
      .where(inArray(categorySubscription.category, categories));
  }
}
