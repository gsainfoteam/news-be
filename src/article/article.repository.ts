import { Injectable, Logger } from '@nestjs/common';
import {
  ArticleEntity,
  DrizzleService,
  EditorEntity,
  existOrThrow,
} from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { article, editor } from 'drizzle/schema';
import {
  eq,
  sql,
  ilike,
  and,
  or,
  desc,
  arrayContains,
  SQL,
  isNull,
} from 'drizzle-orm';
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
  async getArticles(
    query: SearchArticlesDto,
  ): Promise<{ article: ArticleEntity; editor: EditorEntity }[]> {
    const { offset, limit, sort } = query;
    const whereClause = this.buildWhereClause(query);

    let orderClause: SQL;
    if (sort === ArticleSort.MOST_POPULAR) orderClause = desc(article.views);
    else if (sort === ArticleSort.RANDOM) orderClause = sql`RANDOM()`;
    else orderClause = desc(article.createdAt);

    return await this.drizzleService.db
      .select()
      .from(article)
      .innerJoin(editor, eq(article.editorId, editor.id))
      .where(whereClause)
      .orderBy(orderClause)
      .offset(offset)
      .limit(limit);
  }

  /*
  SELECT COUNT(*) FROM article
  WHERE ...
  */
  async countArticles(query: SearchArticlesDto): Promise<number> {
    const whereClause = this.buildWhereClause(query);
    return await this.drizzleService.db
      .select({ count: sql<number>`count(*)` })
      .from(article)
      .where(whereClause)
      .then((result) => result[0].count);
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
  SELECT * FROM article
  WHERE id = id AND deleted_at IS NULL;
  */
  async getArticle(
    id: number,
  ): Promise<{ article: ArticleEntity; editor: EditorEntity }> {
    return await this.drizzleService.db
      .select()
      .from(article)
      .innerJoin(editor, eq(article.editorId, editor.id))
      .where(and(eq(article.id, id), isNull(article.deletedAt)))
      .then(existOrThrow('Article not found'));
  }

  /*
  UPDATE article
  SET views = views + 1
  WHERE id = id
  */
  async incrementViews(id: number): Promise<void> {
    await this.drizzleService.db
      .update(article)
      .set({ views: sql`${article.views} + 1` })
      .where(and(eq(article.id, id), isNull(article.deletedAt)))
      .returning()
      .then(existOrThrow('Article not found'));
  }

  /*
  UPDATE article
  SET title = title, content = content, image_keys = image_keys, categories = categories
  WHERE id = id
  */
  async updateArticle(id: number, body: UpdateArticleDto): Promise<void> {
    await this.drizzleService.db
      .update(article)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(article.id, id), isNull(article.deletedAt)))
      .returning()
      .then(existOrThrow('Article not found'));
  }

  /*
  UPDATE article
  SET deleted_at = CURRENT_TIMESTAMP
  WHERE id = id
  */
  async deleteArticle(id: number): Promise<void> {
    await this.drizzleService.db
      .update(article)
      .set({ deletedAt: new Date() })
      .where(and(eq(article.id, id), isNull(article.deletedAt)))
      .returning()
      .then(existOrThrow('Article not found'));
  }

  private buildWhereClause({
    search,
    category,
  }: SearchArticlesDto): SQL | undefined {
    const whereConditions: (SQL | undefined)[] = [isNull(article.deletedAt)];
    if (search) {
      whereConditions.push(
        or(
          ilike(article.title, `%${search}%`),
          ilike(article.content, `%${search}%`),
        ),
      );
    }
    if (category) {
      whereConditions.push(arrayContains(article.categories, [category]));
    }
    return and(...whereConditions);
  }
}
