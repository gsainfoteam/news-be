import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({
    description: 'File name of the image to be uploaded',
    example: 'image',
  })
  @IsString()
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
