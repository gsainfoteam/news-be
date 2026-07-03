import { Injectable, Logger } from '@nestjs/common';
import { ArticleEntity, DrizzleService, existOrThrow } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { article } from 'drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { CreateArticleDto } from './dto/req/create-article.dto';

@Loggable()
@Injectable()
export class ArticleRepository {
  private readonly logger = new Logger(ArticleRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  INSERT INTO article (title, content, image_keys, editor_id, category_id)
  VALUES (title, content, image_keys, editor_id, category_id);
  */
  async createArticle(
    editorId: string,
    body: CreateArticleDto,
  ): Promise<ArticleEntity> {
    return await this.drizzleService.db
      .insert(article)
      .values({ ...body, editorId })
      .returning()
      .then(existOrThrow('Failed to create article'));
  }

  /*
  UPDATE article
  SET views = views + 1
  WHERE id = id
  RETURNING *;
  */
  async getArticle(id: number): Promise<ArticleEntity> {
    return await this.drizzleService.db
      .update(article)
      .set({ views: sql`${article.views} + 1` })
      .where(eq(article.id, id))
      .returning()
      .then(existOrThrow('Article not found'));
  }
}
