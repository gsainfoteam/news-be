import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { asc, isNotNull, ne, sql } from 'drizzle-orm';

import { DrizzleService } from '../../database/drizzle.service';
import { PrismaService } from '../../database/prisma.service';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { articles } from '../../database/drizzle.schema';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly drizzle: DrizzleService,
  ) {}

  async list(query: ListArticlesQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const where: Prisma.ArticleWhereInput = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.query
        ? {
            OR: [
              { title: { contains: query.query } },
              { summary: { contains: query.query } },
              { content: { contains: query.query } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { total, items, limit, offset };
  }

  async listCategories() {
    const rows = await this.drizzle.db
      .select({ value: articles.category })
      .from(articles)
      .where(sql`${isNotNull(articles.category)} and ${ne(articles.category, '')}`)
      .groupBy(articles.category)
      .orderBy(asc(articles.category));

    return rows.map((row) => row.value).filter((value): value is string => Boolean(value));
  }

  async get(id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async create(payload: CreateArticleDto) {
    return this.prisma.article.create({
      data: {
        ...payload,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
      },
    });
  }

  async update(id: number, payload: UpdateArticleDto) {
    await this.get(id);

    return this.prisma.article.update({
      where: { id },
      data: {
        ...payload,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.get(id);
    await this.prisma.article.delete({ where: { id } });
  }
}
