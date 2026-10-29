import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NewspaperUploadUrlDto {
  @ApiProperty({
    description:
      'Upload URL (presigned url). PUT the file here within 5 minutes with the same Content-Length and the `Content-Type` header set to `contentType`.',
    example: 'https://example.com/upload',
  })
  @Expose()
  uploadUrl!: string;

  @ApiProperty({
    description: 'Content-Type header to send with the PUT request',
    example: 'application/pdf',
  })
  @Expose()
  contentType!: string;

  @ApiProperty({
    description: 'File key for `POST /newspaper` request',
    example: 'newspaper/123e4567-e89b-42d3-a456-426614174000/issue_123.pdf',
  })
  @Expose()
  key!: string;

  constructor(uploadUrl: string, contentType: string, key: string) {
    this.uploadUrl = uploadUrl;
    this.contentType = contentType;
    this.key = key;
  }
}
