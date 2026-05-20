import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNicknameDto {
  @ApiProperty({
    description: 'nickname',
    example: '지니어스',
  })
  @IsString()
  nickname!: string;
}
