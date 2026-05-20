import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Loggable } from '@lib/logger';
import { UserEntity } from '@lib/drizzle';
import { UserDto } from './dto/res/user.dto';
import { EditorService } from 'src/editor/editor.service';

@Loggable()
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly editorService: EditorService,
  ) {}

  async getMe(user: UserEntity) {
    const editor = await this.editorService.findEditorByEmail(user.email);
    return new UserDto(user, editor);
  }

  async findUserById(id: string) {
    return await this.userRepository.findUserById(id);
  }
}
