import { ArticleEntity, Category, MemberEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { CommentDto } from 'src/comment/dto/res/comment.dto';

@Exclude()
class AuthorInfoDto {
  @ApiProperty({
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'name',
    example: 'Member Name',
  })
  @Expose()
  name!: string;

  constructor(author: MemberEntity) {
    Object.assign(this, author);
  }
}

@Exclude()
export class ArticleDto {
  @ApiProperty({
    description: 'id',
    example: '1',
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'title',
    example: 'Article Title',
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: 'subtitle',
    type: String,
    nullable: true,
    example: 'Article Subtitle',
  })
  @Expose()
  subtitle!: string | null;

  @ApiProperty({
    description: 'content',
    example: 'Article Content',
  })
  @Expose()
  content!: string;

  @ApiPropertyOptional({
    description: 'thumbnail image public url',
    type: String,
    nullable: true,
    example:
      'https://s3.ap-northeast-2.amazonaws.com/bucket/articles/image1.jpg',
  })
  @Expose()
  thumbnailUrl!: string | null;

  @ApiProperty({
    description: 'views',
    example: 100,
  })
  @Expose()
  views!: number;

  @ApiProperty({
    description: 'categories',
    example: [Category.SOCIETY],
    enum: Category,
    isArray: true,
  })
  @Expose()
  categories!: Category[];

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
    description: 'authors information',
    type: [AuthorInfoDto],
  })
  @Expose()
  authors!: AuthorInfoDto[];

  @ApiProperty({
    description: 'comments on the article',
    type: [CommentDto],
  })
  @Expose()
  comments!: CommentDto[];

  constructor({
    article,
    authors,
    comments = [],
    thumbnailUrl,
  }: {
    article: ArticleEntity;
    authors: MemberEntity[];
    comments?: CommentDto[];
    thumbnailUrl: string | null;
  }) {
    Object.assign(this, article);
    this.thumbnailUrl = thumbnailUrl;
    this.authors = authors.map((author) => new AuthorInfoDto(author));
    this.comments = comments;
  }
}
