import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { DrizzleModule } from '@lib/drizzle';
import { ImageModule } from '@lib/image';
import { EditorModule } from 'src/editor/editor.module';

@Module({
  imports: [DrizzleModule, ImageModule, EditorModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
