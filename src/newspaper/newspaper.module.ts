import { Module } from '@nestjs/common';
import { DrizzleModule } from '@lib/drizzle';
import { FileModule } from '@lib/file';
import { MemberModule } from 'src/member/member.module';
import { NewspaperController } from './newspaper.controller';
import { NewspaperService } from './newspaper.service';
import { NewspaperRepository } from './newspaper.repository';

@Module({
  imports: [DrizzleModule, FileModule, MemberModule],
  controllers: [NewspaperController],
  providers: [NewspaperService, NewspaperRepository],
})
export class NewspaperModule {}
