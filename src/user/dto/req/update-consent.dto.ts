import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConsentDto {
  @ApiPropertyOptional({
    description: 'Terms agreed status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTermsAgreed?: boolean;

  @ApiPropertyOptional({
    description: 'Privacy agreed status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrivacyAgreed?: boolean;
}
