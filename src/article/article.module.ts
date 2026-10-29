import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { DrizzleModule } from '@lib/drizzle';
import { FileModule } from '@lib/file';
import { MemberModule } from 'src/member/member.module';
import { CommentModule } from 'src/comment/comment.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [
    DrizzleModule,
    FileModule,
    MemberModule,
    CommentModule,
    SubscriptionModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
