import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateHistoryDto {
  @ApiProperty({ description: 'date (YYYY-MM-DD)', example: '2016-04-11' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  @IsDateString({ strict: true })
  date!: string;

  @ApiProperty({
    description: 'content',
    example: '지스트 공식 언론 지스트신문 창간호 발행',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
