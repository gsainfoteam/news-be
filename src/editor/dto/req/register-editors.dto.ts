import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterEditorsDto {
  @ApiProperty({
    description: 'The email address of the editor to register',
    example: 'editor@example.com',
  })
  @IsString()
  @IsEmail({})
  email!: string;

  @ApiProperty({
    description: 'The name of the editor to register',
    example: 'Editor Name',
  })
  @IsString()
  name!: string;
}
