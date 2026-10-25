import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { DrizzleModule } from '@lib/drizzle';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [DrizzleModule, MemberModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
