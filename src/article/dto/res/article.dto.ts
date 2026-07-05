import { ArticleEntity, Category, EditorEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
class EditorInfoDto {
  @ApiProperty({
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'email',
    example: 'editor@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'name',
    example: 'Editor Name',
  })
  @Expose()
  name!: string;

  constructor(editor: EditorEntity) {
    Object.assign(this, editor);
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
    description: 'editor information',
  })
  @Expose()
  editor!: EditorInfoDto;

  constructor({
    article,
    editor,
  }: {
    article: ArticleEntity;
    editor: EditorEntity;
  }) {
    Object.assign(this, article);
    this.editor = new EditorInfoDto(editor);
  }
}
