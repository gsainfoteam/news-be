import { CommentEntity, UserEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export const DELETED_COMMENT_CONTENT = '삭제된 댓글입니다';

@Exclude()
class UserInfoDto {
  @ApiProperty({
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiPropertyOptional({
    description: 'profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  @Expose()
  picture!: string | null;

  @ApiPropertyOptional({
    description: 'nickname',
    example: '지니어스',
    type: String,
  })
  @Expose()
  nickname!: string | null;

  constructor(user: UserEntity) {
    Object.assign(this, user);
  }
}

@Exclude()
export class CommentDto {
  @ApiProperty({
    description: 'id',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'id of the article the comment belongs to',
    example: 1,
  })
  @Expose()
  articleId!: number;

  @ApiPropertyOptional({
    description: 'parent comment information',
    example: 1,
  })
  @Expose()
  parentId!: number | null;

  @ApiProperty({
    description: `comment content. Replaced with "${DELETED_COMMENT_CONTENT}" when isDeleted is true.`,
    example: 'Great article!',
  })
  @Expose()
  content!: string;

  @ApiProperty({
    description:
      'true when the comment was deleted but is kept as a placeholder because it still has replies',
    example: false,
  })
  @Expose()
  isDeleted!: boolean;

  @ApiProperty({
    description: 'created at',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'updated at',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({
    description: 'author information',
  })
  @Expose()
  user!: UserInfoDto;

  constructor({ comment, user }: { comment: CommentEntity; user: UserEntity }) {
    Object.assign(this, comment);
    this.isDeleted = comment.deletedAt !== null;
    this.content = this.isDeleted ? DELETED_COMMENT_CONTENT : comment.content;
    this.user = new UserInfoDto(user);
  }
}
