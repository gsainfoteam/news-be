import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({
    description:
      'File name of the image to be uploaded (only letters, numbers, hyphens, underscores, and dots allowed)',
    example: 'image_1.png',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'fileName must contain only letters, numbers, hyphens, underscores, and dots',
  })
  fileName!: string;

  @ApiProperty({
    description: 'Content length of image file in bytes',
    example: 1024,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  contentLength!: number;
}
