import { CommentEntity, UserEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

  @ApiProperty({
    description: 'comment content',
    example: 'Great article!',
  })
  @Expose()
  comment!: string;

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
    this.user = new UserInfoDto(user);
  }
}
