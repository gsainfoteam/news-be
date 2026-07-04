import { Category } from '@lib/drizzle';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArticleSort } from 'src/article/enum/article-sort.enum';

export class SearchArticlesDto {
  @ApiPropertyOptional({
    description: 'search query',
    example: 'title',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'category',
    example: Category.SOCIETY,
    enum: Category,
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    description: 'sort order',
    example: ArticleSort.LATEST,
    enum: ArticleSort,
  })
  @IsOptional()
  @IsEnum(ArticleSort)
  sort?: ArticleSort;
}
