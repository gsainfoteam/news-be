import { Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { ArticleDto } from './dto/res/article.dto';
import { CreateArticleDto } from './dto/req/create-article.dto';
import { UploadUrlInfoDto } from './dto/res/upload-url-info.dto';
import * as crypto from 'crypto';
import { CreatePresignedUrlDto } from './dto/req/create-presigned-url.dto';
import { ImageService } from '@lib/image';
import { UpdateArticleDto } from './dto/req/update-article.dto';
import { SearchArticlesDto } from './dto/req/search-articles.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly imageService: ImageService,
  ) {}

  async getArticles(query: SearchArticlesDto): Promise<ArticleDto[]> {
    const articles = await this.articleRepository.getArticles(query);
    return articles.map((article) => new ArticleDto(article));
  }

  async createArticle(
    editorId: string,
    body: CreateArticleDto,
  ): Promise<ArticleDto> {
    if (body.imageKeys)
      for (const key of body.imageKeys)
        await this.imageService.verifyFileExist(key);

    const article = await this.articleRepository.createArticle(editorId, body);
    return new ArticleDto(article);
  }

  async getUploadUrl(body: CreatePresignedUrlDto): Promise<UploadUrlInfoDto> {
    const key = `articles/${new Date().toISOString().split('T')[0]}/${crypto.randomBytes(16).toString('base64url')}-${body.fileName}`;
    const ext = body.fileName.split('.').pop()?.toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === 'gif') {
      contentType = 'image/gif';
    } else if (ext === 'webp') {
      contentType = 'image/webp';
    }

    return {
      uploadUrl: await this.imageService.createPresignedUrl(
        key,
        body.contentLength,
        contentType,
      ),
      publicUrl: this.imageService.getUrl(key),
      key,
    };
  }

  async getArticle(id: number): Promise<ArticleDto> {
    const article = await this.articleRepository.getArticle(id);
    return new ArticleDto(article);
  }

  async updateArticle(id: number, body: UpdateArticleDto): Promise<ArticleDto> {
    if (body.imageKeys)
      for (const key of body.imageKeys)
        await this.imageService.verifyFileExist(key);

    const article = await this.articleRepository.updateArticle(id, body);
    return new ArticleDto(article);
  }

  async deleteArticle(id: number): Promise<void> {
    await this.articleRepository.deleteArticle(id);
  }
}
