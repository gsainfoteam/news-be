import { AboutEntity, HistoryEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { HistoryDto } from './history.dto';

@Exclude()
export class AboutDto {
  @ApiProperty({ description: 'introduction' })
  @Expose()
  introduction!: string;

  @ApiProperty({ description: 'founded at', example: '2016-04-11' })
  @Expose()
  foundedAt!: string;

  @ApiProperty({ description: '발행인', example: '임기철' })
  @Expose()
  publisher!: string;

  @ApiProperty({ description: '주간', example: '홍성민' })
  @Expose()
  director!: string;

  @ApiProperty({ description: '편집장', example: '이다연' })
  @Expose()
  editorInChief!: string;

  @ApiProperty({
    description: 'address',
    example: '광주광역시 북구 첨단과기로 123 제1학생회관 3층 GIST 신문사',
  })
  @Expose()
  address!: string;

  @ApiProperty({ description: 'email', example: 'editor@gist.ac.kr' })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'homepage',
    example: 'https://www.gistnews.co.kr',
  })
  @Expose()
  homepage!: string;

  @ApiProperty({
    description: 'instagram',
    example: 'https://www.instagram.com/gistnews._.official',
  })
  @Expose()
  instagram!: string;

  @ApiProperty({ description: 'history, oldest first', type: [HistoryDto] })
  @Expose()
  @Type(() => HistoryDto)
  histories!: HistoryDto[];

  constructor(about: AboutEntity, histories: HistoryEntity[]) {
    Object.assign(this, about);
    this.histories = histories.map((history) => new HistoryDto(history));
  }
}
