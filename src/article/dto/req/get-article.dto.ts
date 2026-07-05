import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetArticleDto {
  @ApiPropertyOptional({
    description: 'Whether to increment the view count (defaults to true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  increaseView: boolean = true;
}
