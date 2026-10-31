import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateAboutDto {
  @ApiPropertyOptional({ description: 'introduction' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  introduction?: string;

  @ApiPropertyOptional({
    description: 'founded at (YYYY-MM-DD)',
    example: '2016-04-11',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'foundedAt must be YYYY-MM-DD' })
  @IsDateString({ strict: true })
  foundedAt?: string;

  @ApiPropertyOptional({ description: '발행인', example: '임기철' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  publisher?: string;

  @ApiPropertyOptional({ description: '주간', example: '홍성민' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  director?: string;

  @ApiPropertyOptional({ description: '편집장', example: '이다연' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  editorInChief?: string;

  @ApiPropertyOptional({
    description: 'address',
    example: '광주광역시 북구 첨단과기로 123 제1학생회관 3층 GIST 신문사',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'email', example: 'editor@gist.ac.kr' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'homepage',
    example: 'https://www.gistnews.co.kr',
  })
  @IsOptional()
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  homepage?: string;

  @ApiPropertyOptional({
    description: 'instagram',
    example: 'https://www.instagram.com/gistnews._.official',
  })
  @IsOptional()
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  instagram?: string;
}
