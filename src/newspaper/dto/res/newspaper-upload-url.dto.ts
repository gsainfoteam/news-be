import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NewspaperUploadUrlDto {
  @ApiProperty({
    description:
      'Upload URL (presigned url). PUT the file here with the same Content-Length and `Content-Type: application/pdf` within 5 minutes.',
    example: 'https://example.com/upload',
  })
  @Expose()
  uploadUrl!: string;

  @ApiProperty({
    description: 'File key for `POST /newspaper` request',
    example: 'newspaper/123e4567-e89b-42d3-a456-426614174000/issue_123.pdf',
  })
  @Expose()
  key!: string;

  constructor(uploadUrl: string, key: string) {
    this.uploadUrl = uploadUrl;
    this.key = key;
  }
}
