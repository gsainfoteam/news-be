import { Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { ArticleDto } from './dto/res/article.dto';
import { CreateArticleDto } from './dto/req/create-article.dto';
import { UploadUrlInfoDto } from './dto/res/upload-url-info.dto';
import * as crypto from 'crypto';
import { CreatePresignedUrlDto } from './dto/req/create-presigned-url.dto';
import { ImageService } from '@lib/image';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly imageService: ImageService,
  ) {}

  async createArticle(
    editorId: string,
    body: CreateArticleDto,
  ): Promise<ArticleDto> {
    const article = await this.articleRepository.createArticle(editorId, body);
    return new ArticleDto(article);
  }

  async getUploadUrl(body: CreatePresignedUrlDto): Promise<UploadUrlInfoDto> {
    const key = `articles/${new Date().getDate()}/${crypto.randomBytes(16).toString('base64url')}-${body.fileName}.webp`;
    return {
      uploadUrl: await this.imageService.createPresignedUrl(
        key,
        body.contentLength,
      ),
      publicUrl: this.imageService.getUrl(key),
      key,
    };
  }

  async getArticle(id: number): Promise<ArticleDto> {
    const article = await this.articleRepository.getArticle(id);
    return new ArticleDto(article);
  }
}
