import { ArticleEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

  @ApiProperty({
    description: 'content',
    example: 'Article Content',
  })
  @Expose()
  content!: string;

  @ApiProperty({
    description: 'views',
    example: 100,
  })
  @Expose()
  views!: number;

  @ApiProperty({
    description: 'editor id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  editorId!: string;

  @ApiProperty({
    description: 'category id',
    example: 1,
  })
  @Expose()
  categoryId!: number;

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

  constructor(article: ArticleEntity) {
    Object.assign(this, article);
  }
}
