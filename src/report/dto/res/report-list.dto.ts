import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ReportDto } from './report.dto';

@Exclude()
export class ReportListDto {
  @ApiProperty({
    description: 'List of retrieved reports, newest first',
    type: [ReportDto],
  })
  @Expose()
  @Type(() => ReportDto)
  reports!: ReportDto[];

  @ApiProperty({
    description: 'Total number of reports',
    example: 42,
  })
  @Expose()
  count!: number;

  constructor(reports: ReportDto[], count: number) {
    this.reports = reports;
    this.count = count;
  }
}
