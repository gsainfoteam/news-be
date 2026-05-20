import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { DrizzleModule } from '@lib/drizzle';
import { EditorModule } from 'src/editor/editor.module';

@Module({
  imports: [DrizzleModule, EditorModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
