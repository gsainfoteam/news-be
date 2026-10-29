import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const NEWSPAPER_FILE_KEY_PATTERN =
  /^newspaper\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z0-9_.-]+\.pdf$/;

export class CreateNewspaperDto {
  @ApiProperty({
    description: 'Title of the newspaper issue',
    example: '제123호',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Key of the PDF file, issued by `POST /newspaper/file`',
    example: 'newspaper/123e4567-e89b-42d3-a456-426614174000/issue_123.pdf',
  })
  @Matches(NEWSPAPER_FILE_KEY_PATTERN, {
    message: 'fileKey must be a key issued by POST /newspaper/file',
  })
  fileKey!: string;
}
