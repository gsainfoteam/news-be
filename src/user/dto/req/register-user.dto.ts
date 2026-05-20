import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'temporary token for user registration',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  })
  @IsString()
  @IsJWT()
  tempToken!: string;

  @ApiPropertyOptional({
    description: 'nickname',
    example: '지니어스',
  })
  @IsOptional()
  @IsString()
  nickname?: string;
}
