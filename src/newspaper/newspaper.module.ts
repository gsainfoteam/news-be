import { Module } from '@nestjs/common';
import { DrizzleModule } from '@lib/drizzle';
import { ImageModule } from '@lib/image';
import { MemberModule } from 'src/member/member.module';
import { NewspaperController } from './newspaper.controller';
import { NewspaperService } from './newspaper.service';
import { NewspaperRepository } from './newspaper.repository';

@Module({
  imports: [DrizzleModule, ImageModule, MemberModule],
  controllers: [NewspaperController],
  providers: [NewspaperService, NewspaperRepository],
})
export class NewspaperModule {}
