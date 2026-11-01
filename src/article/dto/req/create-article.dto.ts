import { Category } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'title',
    example: 'Article Title',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'subtitle',
    example: 'Article Subtitle',
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

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

  @ApiPropertyOptional({
    description: 'thumbnail image key (must be one of imageKeys)',
    type: String,
    nullable: true,
    example: 'image1.jpg',
  })
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsOptional()
  @IsString()
  thumbnailKey?: string | null;

  @ApiProperty({
    description: 'categories',
    example: [Category.SOCIETY],
    enum: Category,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Category, { each: true })
  categories!: Category[];

  @ApiProperty({
    description: '',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  authorIds!: string[];
}
