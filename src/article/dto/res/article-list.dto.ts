import { ArticleEntity, EditorEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ArticleDto } from './article.dto';

@Exclude()
export class ArticleListDto {
  @ApiProperty({
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  articles!: ArticleDto[];

  @ApiProperty({
    description: 'email',
    example: 'editor@example.com',
  })
  @Expose()
  count: number;

  constructor(
    articles: { article: ArticleEntity; editor: EditorEntity }[],
    count: number,
  ) {
    this.articles = articles.map((article) => new ArticleDto(article));
    this.count = count;
  }
}
