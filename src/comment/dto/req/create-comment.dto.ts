import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'comment content',
    example: 'Great article!',
  })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({
    description: 'parent comment id for nested comments',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
