import { Role } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';
import { REGISTRABLE_ROLES, ROLE_DOC } from '../../member.policy';
import { IsEmail, IsIn, IsString } from 'class-validator';

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
    description: `The role (position) of the member. The initial permission is derived from this. EDITOR_IN_CHIEF cannot be assigned here - hand the editorship over with PATCH /member/:id instead.\n\n${ROLE_DOC}`,
    example: Role.CUB_REPORTER,
    enum: REGISTRABLE_ROLES,
  })
  @IsIn(REGISTRABLE_ROLES)
  role!: Role;
}
