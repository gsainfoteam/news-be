import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

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

  @ApiProperty({
    description: 'image keys',
    example: ['image1.jpg', 'image2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  imageKeys!: string[];

  @ApiProperty({
    description: 'category id',
    example: 1,
  })
  @IsNumber()
  categoryId!: number;
}
