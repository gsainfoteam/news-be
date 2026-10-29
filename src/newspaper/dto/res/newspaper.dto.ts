import { NewspaperEntity } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NewspaperDto {
  @ApiProperty({
    description: 'id',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'title',
    example: '제123호',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Public URL of the PDF file',
    example: 'https://example.com/newspaper.pdf',
  })
  @Expose()
  url!: string;

  @ApiProperty({
    description: 'created at',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  constructor(newspaper: NewspaperEntity, url: string) {
    Object.assign(this, newspaper);
    this.url = url;
  }
}
