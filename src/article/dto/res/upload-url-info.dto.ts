import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadUrlInfoDto {
  @ApiProperty({
    description: 'Upload URL',
    example: 'https://example.com/upload',
  })
  @Expose()
  uploadUrl!: string;

  @ApiProperty({
    description: 'Public Image URL',
    example: 'https://example.com/image.jpg',
  })
  @Expose()
  publicUrl!: string;

  @ApiProperty({
    description: 'Image key',
    example: 'image-key-123',
  })
  @Expose()
  key!: string;
}
