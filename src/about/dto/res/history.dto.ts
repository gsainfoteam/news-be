import { HistoryEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HistoryDto {
  @ApiProperty({ description: 'id', example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ description: 'date', example: '2016-04-11' })
  @Expose()
  date!: string;

  @ApiProperty({
    description: 'content',
    example: '지스트 공식 언론 지스트신문 창간호 발행',
  })
  @Expose()
  content!: string;

  constructor(history: HistoryEntity) {
    Object.assign(this, history);
  }
}
