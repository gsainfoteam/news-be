import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { DrizzleModule } from '@lib/drizzle';
import { ImageModule } from '@lib/image';
import { MemberModule } from 'src/member/member.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [DrizzleModule, ImageModule, MemberModule, CommentModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
