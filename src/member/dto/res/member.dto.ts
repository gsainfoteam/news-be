import { MemberEntity, Permission, Role, UserEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemberDto {
  @ApiProperty({
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'email',
    example: 'email@gm.gist.ac.kr',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'name',
    example: '홍길동',
  })
  @Expose()
  name!: string;

  @ApiPropertyOptional({
    description: 'picture',
    example: 'https://.../picture.jpg',
    type: String,
  })
  @Expose()
  picture?: string | null;

  @ApiProperty({
    description: 'position, shown in bylines',
    example: Role.REPORTING_REPORTER,
    enum: Role,
  })
  @Expose()
  role!: Role;

  @ApiProperty({
    description: 'access permission',
    example: Permission.EDITOR,
    enum: Permission,
  })
  @Expose()
  permission!: Permission;

  @ApiProperty({
    description: 'created at',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'updated at',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;

  constructor(member: MemberEntity, user: UserEntity | null) {
    Object.assign(this, user);
    Object.assign(this, member);
  }
}
