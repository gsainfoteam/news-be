import { MemberEntity, Permission, Role, UserEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
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
  picture!: string | null;

  @ApiPropertyOptional({
    description: 'nickname',
    example: '지니어스',
    type: String,
  })
  @Expose()
  nickname!: string | null;

  @ApiPropertyOptional({
    description: 'position in the newsroom, null when the user is not a member',
    example: Role.REPORTING_REPORTER,
    enum: Role,
    nullable: true,
  })
  @Expose()
  role!: Role | null;

  @ApiProperty({
    description: 'access permission',
    example: Permission.NONE,
    enum: Permission,
  })
  @Expose()
  permission!: Permission;

  @ApiPropertyOptional({
    description: 'terms agreed at',
    example: '2026-01-01T00:00:00.000Z',
    type: Date,
  })
  @Expose()
  termsAgreedAt!: Date | null;

  @ApiPropertyOptional({
    description: 'privacy agreed at',
    example: '2026-01-01T00:00:00.000Z',
    type: Date,
  })
  @Expose()
  privacyAgreedAt!: Date | null;

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

  constructor(user: UserEntity, member: MemberEntity | null) {
    Object.assign(this, user);
    this.role = member?.role ?? null;
    this.permission = member?.permission ?? Permission.NONE;
  }
}
