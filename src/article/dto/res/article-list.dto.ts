import { ArticleEntity, EditorEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ArticleDto } from './article.dto';

@Exclude()
export class ArticleListDto {
  @ApiProperty({
    description: 'List of retrieved articles',
    type: [ArticleDto],
  })
  @Expose()
  articles!: ArticleDto[];

  @ApiProperty({
    description: 'Total number of articles matching the search criteria',
    example: 42,
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
