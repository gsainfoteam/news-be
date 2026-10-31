import { Module } from '@nestjs/common';
import { DrizzleModule } from '@lib/drizzle';
import { MemberModule } from 'src/member/member.module';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { AboutRepository } from './about.repository';

@Module({
  imports: [DrizzleModule, MemberModule],
  controllers: [AboutController],
  providers: [AboutService, AboutRepository],
})
export class AboutModule {}
