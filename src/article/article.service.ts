import { ArticleEntity } from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getArticle(id: number): Promise<ArticleEntity> {
    return this.articleRepository.getArticle(id);
  }
}
