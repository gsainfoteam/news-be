import { Role } from '@lib/drizzle';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ROLE_DOC } from '../../member.policy';

export class UpdateMemberDto {
  @ApiPropertyOptional({
    description: 'The name of the member',
    example: '홍길동',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The email address of the member',
    example: 'member@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail({})
  email?: string;

  @ApiPropertyOptional({
    description: `The role of the member. The permission is re-derived from this role, and cannot be set directly.\n\n${ROLE_DOC}`,
    example: Role.REPORTING_REPORTER,
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
