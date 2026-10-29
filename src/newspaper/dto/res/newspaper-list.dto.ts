import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { NewspaperDto } from './newspaper.dto';

@Exclude()
export class NewspaperListDto {
  @ApiProperty({
    description: 'List of retrieved newspapers, newest first',
    type: [NewspaperDto],
  })
  @Expose()
  @Type(() => NewspaperDto)
  newspapers!: NewspaperDto[];

  @ApiProperty({
    description: 'Total number of newspapers',
    example: 42,
  })
  @Expose()
  count!: number;

  constructor(newspapers: NewspaperDto[], count: number) {
    this.newspapers = newspapers;
    this.count = count;
  }
}
