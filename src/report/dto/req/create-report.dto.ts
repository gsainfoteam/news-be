import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { MAX_REPORT_FILES, REPORT_FILE_KEY_PATTERN } from '../../report.policy';

export class CreateReportDto {
  @ApiProperty({
    description: 'Name of the reporter',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    description: 'Email address of the reporter',
    example: 'reporter@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description:
      'Phone number of the reporter. Stored in the international format, e.g. `010-1234-5678` → `+82 10 1234 5678`.',
    example: '010-1234-5678',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? (parsePhoneNumberFromString(value, 'KR')?.formatInternational() ??
        value)
      : value,
  )
  @IsPhoneNumber('KR')
  phone!: string;

  @ApiPropertyOptional({
    description: 'Title of the report',
    example: '학생회관 시설 관련 제보',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Content of the report',
    example: '학생회관 2층 ...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  description!: string;

  @ApiPropertyOptional({
    description: `Keys of the attached files, issued by \`POST /report/file\`. Up to ${MAX_REPORT_FILES} files.`,
    example: ['report/123e4567-e89b-42d3-a456-426614174000/evidence.png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_REPORT_FILES)
  @ArrayUnique()
  @Matches(REPORT_FILE_KEY_PATTERN, {
    each: true,
    message: 'fileKeys must be keys issued by POST /report/file',
  })
  fileKeys?: string[];
}
