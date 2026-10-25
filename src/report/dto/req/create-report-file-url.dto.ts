import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import {
  MAX_REPORT_FILE_SIZE,
  REPORT_FILE_CONTENT_TYPES,
} from '../../report.policy';

export class CreateReportFileUrlDto {
  @ApiProperty({
    description: `File name to upload (only letters, numbers, hyphens, underscores, and dots allowed). Allowed extensions: ${Object.keys(REPORT_FILE_CONTENT_TYPES).join(', ')}`,
    example: 'evidence.png',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'fileName must contain only letters, numbers, hyphens, underscores, and dots',
  })
  fileName!: string;

  @ApiProperty({
    description: `Content length of the file in bytes (max ${MAX_REPORT_FILE_SIZE})`,
    example: 1024,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_REPORT_FILE_SIZE)
  contentLength!: number;
}
