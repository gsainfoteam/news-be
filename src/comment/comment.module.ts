import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { DrizzleModule } from '@lib/drizzle';
import { EditorModule } from 'src/editor/editor.module';

@Module({
  imports: [DrizzleModule, EditorModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
