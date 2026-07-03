import { Injectable, Logger } from '@nestjs/common';
import { ArticleEntity, DrizzleService, existOrThrow } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { article } from 'drizzle/schema';
import { eq, sql } from 'drizzle-orm';

@Loggable()
@Injectable()
export class ArticleRepository {
  private readonly logger = new Logger(ArticleRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  async getArticle(id: number): Promise<ArticleEntity> {
    return await this.drizzleService.db
      .update(article)
      .set({ views: sql`${article.views} + 1` })
      .where(eq(article.id, id))
      .returning()
      .then(existOrThrow('Article not found'));
  }
}
