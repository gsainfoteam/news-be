import { Category } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'title',
    example: 'Article Title',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'content',
    example: 'Article Content',
  })
  @IsString()
  content!: string;

  @ApiPropertyOptional({
    description: 'image keys',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageKeys?: string[];

  @ApiProperty({
    description: 'categories',
    example: [Category.SOCIETY],
  })
  @IsArray()
  @IsEnum(Category, { each: true })
  categories!: Category[];
}
