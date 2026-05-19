import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Loggable } from '@lib/logger';

@Loggable()
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: string) {
    return await this.userRepository.findUserById(id);
  }
}
