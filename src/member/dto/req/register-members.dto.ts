import { Role } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class RegisterMembersDto {
  @ApiProperty({
    description: 'The email address of the member to register',
    example: 'member@example.com',
  })
  @IsString()
  @IsEmail({})
  email!: string;

  @ApiProperty({
    description: 'The name of the member to register',
    example: 'Member Name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description:
      'The role (position) of the member. The initial permission is derived from this.',
    example: Role.CUB_REPORTER,
    enum: Role,
  })
  @IsEnum(Role)
  role!: Role;
}
