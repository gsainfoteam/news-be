import { Category } from '@lib/drizzle';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleSort } from 'src/article/enum/article-sort.enum';

export class SearchArticlesDto {
  @ApiPropertyOptional({
    description: 'offset for pagination',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({
    description: 'limit for pagination',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

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
