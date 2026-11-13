import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsJWT, IsOptional, IsString, ValidateIf } from 'class-validator';

/** Either the IdP authorization code, or the ticket from a consent rejection with the signup input. */
export class LoginDto {
  @ApiPropertyOptional({ type: String })
  @ValidateIf((o: LoginDto) => o.ticket === undefined)
  @IsString()
  code!: string;

  @ApiPropertyOptional({ type: String })
  @ValidateIf((o: LoginDto) => o.ticket === undefined)
  @IsString()
  code_verifier!: string;

  @ApiPropertyOptional({ type: String })
  @ValidateIf((o: LoginDto) => o.ticket === undefined)
  @IsString()
  redirect_uri!: string;

  @ApiPropertyOptional({ type: String })
  @ValidateIf((o: LoginDto) => o.ticket === undefined)
  @IsString()
  nonce!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  iss?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The ticket from a 403 session_rejected response',
  })
  @IsOptional()
  @IsJWT()
  ticket?: string;

  @ApiPropertyOptional({
    description: 'nickname, with a ticket only',
    example: '지니어스',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ enum: ['cookie'] })
  @IsOptional()
  @IsIn(['cookie'])
  transport?: 'cookie';
}
