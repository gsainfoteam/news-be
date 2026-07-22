import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'new comment content',
    example: 'Edited comment',
  })
  @IsString()
  @MinLength(1)
  comment!: string;
}
