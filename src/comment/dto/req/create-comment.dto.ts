import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'comment content',
    example: 'Great article!',
  })
  @IsString()
  @MinLength(1)
  comment!: string;
}
