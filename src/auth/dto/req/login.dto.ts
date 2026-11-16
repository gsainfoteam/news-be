import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { LoginBody } from '@infoteam/account-nest/dto';

export class LoginDto extends LoginBody {
  @ApiPropertyOptional({
    description: 'nickname, with a ticket only',
    example: '지니어스',
  })
  @IsOptional()
  @IsString()
  nickname?: string;
}
