import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class CreateNewspaperFileUrlDto {
  @ApiProperty({
    description:
      'PDF file name to upload (only letters, numbers, hyphens, underscores, and dots allowed, must end with .pdf)',
    example: 'issue_123.pdf',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_.-]+\.pdf$/, {
    message:
      'fileName must be a .pdf name containing only letters, numbers, hyphens, underscores, and dots',
  })
  fileName!: string;

  @ApiProperty({
    description: 'Content length of the file in bytes (max 100MB)',
    example: 1024,
  })
  @IsInt()
  @Min(1)
  @Max(100 * 1024 * 1024)
  contentLength!: number;
}
