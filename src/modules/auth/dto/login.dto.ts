import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    username!: string;

    @ApiProperty({ example: 'password' })
    @IsString()
    @MinLength(1)
    password!: string;
}
