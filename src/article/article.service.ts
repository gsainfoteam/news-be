import { BadRequestException, Injectable } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { ArticleDto } from './dto/res/article.dto';
import { CreateArticleDto } from './dto/req/create-article.dto';
import { UploadUrlInfoDto } from './dto/res/upload-url-info.dto';
import * as crypto from 'crypto';
import { CreatePresignedUrlDto } from './dto/req/create-presigned-url.dto';
import { FileService } from '@lib/file';
import { UpdateArticleDto } from './dto/req/update-article.dto';
import { SearchArticlesDto } from './dto/req/search-articles.dto';
import { GetArticleDto } from './dto/req/get-article.dto';
import { ArticleListDto } from './dto/res/article-list.dto';
import { CommentService } from 'src/comment/comment.service';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly fileService: FileService,
    private readonly commentService: CommentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getArticles(query: SearchArticlesDto): Promise<ArticleListDto> {
    const [articles, count] = await Promise.all([
      this.articleRepository.getArticles(query),
      this.articleRepository.countArticles(query),
    ]);
    return new ArticleListDto(
      articles.map((value) => ({
        ...value,
        thumbnailUrl:
          value.article.thumbnailKey &&
          this.fileService.getUrl(value.article.thumbnailKey),
      })),
      count,
    );
  }
  async createArticle(body: CreateArticleDto): Promise<ArticleDto> {
    if (body.imageKeys) {
      await Promise.all(
        body.imageKeys.map((key) => this.fileService.verifyFileExist(key)),
      );
    }
    if (
      body.thumbnailKey != null &&
      !body.imageKeys?.includes(body.thumbnailKey)
    ) {
      throw new BadRequestException('thumbnailKey must be one of imageKeys');
    }

    const article = await this.articleRepository.createArticle(body);
    const result = await this.articleRepository.getArticle(article.id);
    void this.subscriptionService.notifyNewArticle(result);
    return new ArticleDto({
      ...result,
      thumbnailUrl:
        result.article.thumbnailKey &&
        this.fileService.getUrl(result.article.thumbnailKey),
    });
  }

  async getUploadUrl(body: CreatePresignedUrlDto): Promise<UploadUrlInfoDto> {
    const key = `articles/${new Date().toISOString().split('T')[0]}/${crypto.randomBytes(16).toString('base64url')}-${body.fileName}`;
    const ext = body.fileName.split('.').pop()?.toLowerCase();

    let contentType: string;
    if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === 'gif') {
      contentType = 'image/gif';
    } else if (ext === 'webp') {
      contentType = 'image/webp';
    } else {
      throw new BadRequestException(`File extension .${ext} is not allowed`);
    }

    return {
      uploadUrl: await this.fileService.createPresignedUrl(
        key,
        body.contentLength,
        contentType,
      ),
      contentType,
      publicUrl: this.fileService.getUrl(key),
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
    return new ArticleDto({
      ...article,
      comments,
      thumbnailUrl:
        article.article.thumbnailKey &&
        this.fileService.getUrl(article.article.thumbnailKey),
    });
  }

  async updateArticle(id: number, body: UpdateArticleDto): Promise<ArticleDto> {
    if (body.imageKeys) {
      await Promise.all(
        body.imageKeys.map((key) => this.fileService.verifyFileExist(key)),
      );
    }
    if (body.imageKeys !== undefined || body.thumbnailKey !== undefined) {
      const { article: current } = await this.articleRepository.getArticle(id);
      const thumbnailKey =
        body.thumbnailKey === undefined
          ? current.thumbnailKey
          : body.thumbnailKey;
      if (
        thumbnailKey != null &&
        !(
          body.imageKeys === undefined ? current.imageKeys : body.imageKeys
        )?.includes(thumbnailKey)
      ) {
        throw new BadRequestException('thumbnailKey must be one of imageKeys');
      }
    }

    await this.articleRepository.updateArticle(id, body);
    const article = await this.articleRepository.getArticle(id);
    return new ArticleDto({
      ...article,
      thumbnailUrl:
        article.article.thumbnailKey &&
        this.fileService.getUrl(article.article.thumbnailKey),
    });
  }

  async deleteArticle(id: number): Promise<void> {
    await this.articleRepository.deleteArticle(id);
  }
}
