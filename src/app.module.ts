import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from '@lib/logger';
import { MemberModule } from './member/member.module';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';
import { PostgresExceptionFilter } from '@lib/drizzle';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule,
    UserModule,
    MemberModule,
    ArticleModule,
    CommentModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PostgresExceptionFilter,
    },
  ],
})
export class AppModule {}
