import { Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { ArticleDto } from './dto/res/article.dto';
import { CreateArticleDto } from './dto/req/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async createArticle(editorId: string, body: CreateArticleDto): Promise<void> {
    await this.articleRepository.createArticle(editorId, body);
  }

  async getArticle(id: number): Promise<ArticleDto> {
    const article = await this.articleRepository.getArticle(id);
    return new ArticleDto(article);
  }
}
