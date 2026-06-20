import { EditorEntity, UserEntity } from '@lib/drizzle';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/user/enum/role.enum';

@Exclude()
export class EditorDto {
  @ApiProperty({
    description: 'email',
    example: 'email@gm.gist.ac.kr',
  })
  @Expose()
  email!: string;

  @ApiPropertyOptional({
    description: 'name',
    example: '홍길동',
  })
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: 'picture',
    example: 'https://.../picture.jpg',
  })
  @Expose()
  picture?: string | null;

  @ApiProperty({
    description: 'user role (USER, EDITOR, EDITORSHIP)',
    example: Role.EDITOR,
    enum: Role,
  })
  @Expose()
  role!: Role;

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

  constructor(editor: EditorEntity, user: UserEntity | null) {
    Object.assign(this, user);
    Object.assign(this, editor);
    this.role = editor.isEditorship ? Role.EDITORSHIP : Role.EDITOR;
  }
}
