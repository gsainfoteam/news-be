import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from '@lib/logger';
import { EditorModule } from './editor/editor.module';
import { ArticleModule } from './article/article.module';
import { PostgresExceptionFilter } from '@lib/drizzle';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule,
    UserModule,
    EditorModule,
    ArticleModule,
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
