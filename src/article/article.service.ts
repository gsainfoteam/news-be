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
import { GetArticleDto } from './dto/req/get-article.dto';
import { ArticleListDto } from './dto/res/article-list.dto';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
  ) {}

  async getArticles(query: SearchArticlesDto): Promise<ArticleListDto> {
    const [articles, count] = await Promise.all([
      this.articleRepository.getArticles(query),
      this.articleRepository.countArticles(query),
    ]);
    return new ArticleListDto(articles, count);
  }
  async createArticle(
    editorId: string,
    body: CreateArticleDto,
  ): Promise<ArticleDto> {
    if (body.imageKeys) {
      await Promise.all(
        body.imageKeys.map((key) => this.imageService.verifyFileExist(key)),
      );
    }

    const article = await this.articleRepository.createArticle(editorId, body);
    const result = await this.articleRepository.getArticle(article.id);
    return new ArticleDto(result);
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

  async getArticle(
    id: number,
    { increaseView }: GetArticleDto,
  ): Promise<ArticleDto> {
    if (increaseView) await this.articleRepository.incrementViews(id);

    const [article, comments] = await Promise.all([
      this.articleRepository.getArticle(id),
      this.commentService.getCommentsByArticle(id),
    ]);
    return new ArticleDto({ ...article, comments });
  }

  async updateArticle(id: number, body: UpdateArticleDto): Promise<ArticleDto> {
    if (body.imageKeys) {
      await Promise.all(
        body.imageKeys.map((key) => this.imageService.verifyFileExist(key)),
      );
    }

    await this.articleRepository.updateArticle(id, body);
    const article = await this.articleRepository.getArticle(id);
    return new ArticleDto(article);
  }

  async deleteArticle(id: number): Promise<void> {
    await this.articleRepository.deleteArticle(id);
  }
}
