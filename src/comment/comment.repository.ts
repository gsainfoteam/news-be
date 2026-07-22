import { Injectable, Logger } from '@nestjs/common';
import {
  CommentEntity,
  DrizzleService,
  UserEntity,
  existOrThrow,
} from '@lib/drizzle';
import { Loggable } from '@lib/logger';
import { comment, user } from 'drizzle/schema';
import { and, asc, eq, isNull } from 'drizzle-orm';

@Loggable()
@Injectable()
export class CommentRepository {
  private readonly logger = new Logger(CommentRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  INSERT INTO comment (user_id, article_id, comment)
  VALUES (user_id, article_id, comment);
  */
  async createComment(
    userId: string,
    articleId: number,
    content: string,
  ): Promise<CommentEntity> {
    return await this.drizzleService.db
      .insert(comment)
      .values({ userId, articleId, comment: content })
      .returning()
      .then(existOrThrow('Failed to create comment'));
  }

  /*
  SELECT * FROM comment
  INNER JOIN "user" ON comment.user_id = "user".id
  WHERE comment.id = id AND comment.deleted_at IS NULL;
  */
  async getComment(
    id: number,
  ): Promise<{ comment: CommentEntity; user: UserEntity }> {
    return await this.drizzleService.db
      .select()
      .from(comment)
      .innerJoin(user, eq(comment.userId, user.id))
      .where(and(eq(comment.id, id), isNull(comment.deletedAt)))
      .then(existOrThrow('Comment not found'));
  }

  /*
  UPDATE comment
  SET comment = comment, updated_at = NOW()
  WHERE id = id AND deleted_at IS NULL;
  */
  async updateComment(
    articleId: number,
    userId: string,
    commentId: number,
    content: string,
  ): Promise<void> {
    await this.drizzleService.db
      .update(comment)
      .set({ comment: content, updatedAt: new Date() })
      .where(
        and(
          eq(comment.articleId, articleId),
          eq(comment.userId, userId),
          eq(comment.id, commentId),
          isNull(comment.deletedAt),
        ),
      )
      .returning()
      .then(existOrThrow('Comment not found'));
  }

  /*
  UPDATE comment
  SET deleted_at = NOW()
  WHERE id = id AND deleted_at IS NULL;
  */
  async deleteComment(id: number): Promise<void> {
    await this.drizzleService.db
      .update(comment)
      .set({ deletedAt: new Date() })
      .where(and(eq(comment.id, id), isNull(comment.deletedAt)))
      .returning()
      .then(existOrThrow('Comment not found'));
  }

  /*
  SELECT * FROM comment
  INNER JOIN "user" ON comment.user_id = "user".id
  WHERE comment.article_id = articleId AND comment.deleted_at IS NULL
  ORDER BY comment.created_at ASC;
  */
  async getCommentsByArticleId(
    articleId: number,
  ): Promise<{ comment: CommentEntity; user: UserEntity }[]> {
    return await this.drizzleService.db
      .select()
      .from(comment)
      .innerJoin(user, eq(comment.userId, user.id))
      .where(and(eq(comment.articleId, articleId), isNull(comment.deletedAt)))
      .orderBy(asc(comment.createdAt));
  }
}
