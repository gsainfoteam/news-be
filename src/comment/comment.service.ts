import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentDto } from './dto/res/comment.dto';
import { CreateCommentDto } from './dto/req/create-comment.dto';
import { UpdateCommentDto } from './dto/req/update-comment.dto';
import { UserEntity } from '@lib/drizzle';
import { EditorService } from 'src/editor/editor.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly editorService: EditorService,
  ) {}

  async createComment(
    articleId: number,
    userId: string,
    { comment }: CreateCommentDto,
  ): Promise<CommentDto> {
    const created = await this.commentRepository.createComment(
      userId,
      articleId,
      comment,
    );
    const result = await this.commentRepository.getComment(created.id);
    return new CommentDto(result);
  }

  async updateComment(
    articleId: number,
    commentId: number,
    userId: string,
    { comment }: UpdateCommentDto,
  ): Promise<CommentDto> {
    await this.commentRepository.updateComment(
      articleId,
      userId,
      commentId,
      comment,
    );
    const result = await this.commentRepository.getComment(commentId);
    return new CommentDto(result);
  }

  async deleteComment(
    articleId: number,
    commentId: number,
    user: UserEntity,
  ): Promise<void> {
    const { comment } = await this.commentRepository.getComment(commentId);
    if (comment.articleId !== articleId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.id) {
      const editor = await this.editorService.findEditorByEmail(user.email);
      if (!editor) {
        throw new ForbiddenException(
          'Only the author or an editor can delete this comment',
        );
      }
    }

    await this.commentRepository.deleteComment(commentId);
  }

  async getCommentsByArticle(articleId: number): Promise<CommentDto[]> {
    const rows = await this.commentRepository.getCommentsByArticleId(articleId);
    return rows.map((row) => new CommentDto(row));
  }
}
