import {
  ArticleEntity,
  DrizzleService,
  MemberEntity,
  existOrThrow,
} from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { article, articleAuthor, member } from 'drizzle/schema';
import {
  eq,
  sql,
  ilike,
  and,
  or,
  desc,
  arrayContains,
  inArray,
  SQL,
  isNull,
} from 'drizzle-orm';
import { Injectable, Logger } from '@nestjs/common';
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
  async getArticles(query: SearchArticlesDto): Promise<
    {
      article: ArticleEntity;
      authors: MemberEntity[];
    }[]
  > {
    const { offset, limit, sort } = query;
    const whereClause = this.buildWhereClause(query);

    let orderClause: SQL;
    if (sort === ArticleSort.MOST_POPULAR) orderClause = desc(article.views);
    else if (sort === ArticleSort.RANDOM) orderClause = sql`RANDOM()`;
    else orderClause = desc(article.createdAt);

    const articles = await this.drizzleService.db
      .select()
      .from(article)
      .where(whereClause)
      .orderBy(orderClause)
      .offset(offset)
      .limit(limit);

    const authorsByArticleId = await this.findAuthorsByArticleIds(
      articles.map((row) => row.id),
    );

    return articles.map((row) => ({
      article: row,
      authors: authorsByArticleId.get(row.id) ?? [],
    }));
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
  INSERT INTO article (title, subtitle, content, image_keys, categories) VALUES (...);
  INSERT INTO article_author (article_id, member_id, sort_order) VALUES (...);
  */
  async createArticle({
    authorIds,
    ...values
  }: CreateArticleDto): Promise<ArticleEntity> {
    return await this.drizzleService.db.transaction(async (tx) => {
      const created = await tx
        .insert(article)
        .values(values)
        .returning()
        .then(existOrThrow('Failed to create article'));

      await tx.insert(articleAuthor).values(
        authorIds.map((memberId, index) => ({
          articleId: created.id,
          memberId,
          sortOrder: index,
        })),
      );

      return created;
    });
  }

  /*
  SELECT * FROM article
  WHERE id = id AND deleted_at IS NULL;
  */
  async getArticle(id: number): Promise<{
    article: ArticleEntity;
    authors: MemberEntity[];
  }> {
    const found = await this.drizzleService.db
      .select()
      .from(article)
      .where(and(eq(article.id, id), isNull(article.deletedAt)))
      .then(existOrThrow('Article not found'));

    return {
      article: found,
      authors: await this.findAuthorsByArticleIds([id]).then(
        (authorsByArticleId) => authorsByArticleId.get(id) ?? [],
      ),
    };
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
  UPDATE article SET ... WHERE id = id;
  DELETE FROM article_author WHERE article_id = id;
  INSERT INTO article_author (article_id, member_id, sort_order) VALUES (...);
  */
  async updateArticle(
    id: number,
    { authorIds, ...values }: UpdateArticleDto,
  ): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      await tx
        .update(article)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(article.id, id), isNull(article.deletedAt)))
        .returning()
        .then(existOrThrow('Article not found'));

      if (!authorIds) return;

      await tx.delete(articleAuthor).where(eq(articleAuthor.articleId, id));
      if (authorIds.length === 0) return;

      await tx.insert(articleAuthor).values(
        authorIds.map((memberId, index) => ({
          articleId: id,
          memberId,
          sortOrder: index,
        })),
      );
    });
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

  /*
  SELECT article_author.article_id, member.*
  FROM article_author
  JOIN member ON member.id = article_author.member_id
  WHERE article_author.article_id IN (ids)
  ORDER BY article_author.sort_order;
  */
  private async findAuthorsByArticleIds(
    ids: number[],
  ): Promise<Map<number, MemberEntity[]>> {
    const authorsByArticleId = new Map<number, MemberEntity[]>();
    if (ids.length === 0) return authorsByArticleId;

    const rows = await this.drizzleService.db
      .select({ articleId: articleAuthor.articleId, author: member })
      .from(articleAuthor)
      .innerJoin(member, eq(articleAuthor.memberId, member.id))
      .where(inArray(articleAuthor.articleId, ids))
      .orderBy(articleAuthor.sortOrder);

    for (const { articleId, author } of rows) {
      const found = authorsByArticleId.get(articleId);
      if (found) found.push(author);
      else authorsByArticleId.set(articleId, [author]);
    }

    return authorsByArticleId;
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
          ilike(article.subtitle, `%${search}%`),
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
