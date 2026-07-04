import { Injectable, Logger } from '@nestjs/common';
import { ArticleEntity, DrizzleService, existOrThrow } from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { article } from 'drizzle/schema';
import { eq, sql, ilike, and, or, desc, arrayContains, SQL } from 'drizzle-orm';
import { CreateArticleDto } from './dto/req/create-article.dto';
import { UpdateArticleDto } from './dto/req/update-article.dto';
import { SearchArticlesDto } from './dto/req/search-articles.dto';
import { ArticleSort } from './enum/article-sort.enum';

@Loggable()
@Injectable()
export class ArticleRepository {
  private readonly logger = new Logger(ArticleRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  SELECT * FROM article
  WHERE ...
  ORDER BY ...
  */
  async getArticles(query: SearchArticlesDto): Promise<ArticleEntity[]> {
    const { search, category, sort } = query;

    const whereConditions: (SQL | undefined)[] = [];
    if (search)
      whereConditions.push(
        or(
          ilike(article.title, `%${search}%`),
          ilike(article.content, `%${search}%`),
        ),
      );
    if (category)
      whereConditions.push(arrayContains(article.categories, [category]));

    let orderClause: SQL;
    if (sort === ArticleSort.MOST_POPULAR) orderClause = desc(article.views);
    else if (sort === ArticleSort.RANDOM) orderClause = sql`RANDOM()`;
    else orderClause = desc(article.createdAt);

    return await this.drizzleService.db
      .select()
      .from(article)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(orderClause);
  }

  /*
  INSERT INTO article (title, content, image_keys, editor_id, categories)
  VALUES (title, content, image_keys, editor_id, categories);
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

  /*
  UPDATE article
  SET title = title, content = content, image_keys = image_keys, categories = categories
  WHERE id = id
  RETURNING *;
  */
  async updateArticle(
    id: number,
    body: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    return await this.drizzleService.db
      .update(article)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(article.id, id))
      .returning()
      .then(existOrThrow('Article not found'));
  }

  /*
  UPDATE article
  SET deleted_at = CURRENT_TIMESTAMP
  WHERE id = id
  RETURNING *;
  */
  async deleteArticle(id: number): Promise<void> {
    await this.drizzleService.db
      .update(article)
      .set({ deletedAt: new Date() })
      .where(eq(article.id, id))
      .returning()
      .then(existOrThrow('Article not found'));
  }
}
