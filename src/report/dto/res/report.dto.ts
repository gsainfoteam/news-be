import { ReportEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ReportFileDto {
  @ApiProperty({
    description: 'file name',
    example: 'evidence.png',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Download URL (presigned url, valid for 10 minutes)',
    example: 'https://example.com/download',
  })
  @Expose()
  url!: string;
}

@Exclude()
export class ReportDto {
  @ApiProperty({
    description: 'id',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'name of the reporter',
    example: '홍길동',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'email of the reporter',
    example: 'reporter@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'phone number of the reporter',
    example: '+82 10 1234 5678',
  })
  @Expose()
  phone!: string;

  @ApiPropertyOptional({
    description: 'title',
    example: '학생회관 시설 관련 제보',
    type: String,
    nullable: true,
  })
  @Expose()
  title!: string | null;

  @ApiProperty({
    description: 'content',
    example: '학생회관 2층 ...',
  })
  @Expose()
  description!: string;

  @ApiProperty({
    description: 'attached files',
    type: [ReportFileDto],
  })
  @Expose()
  @Type(() => ReportFileDto)
  files!: ReportFileDto[];

  @ApiProperty({
    description: 'created at',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  constructor(report: ReportEntity, files: ReportFileDto[]) {
    Object.assign(this, report);
    this.files = files;
  }
}
