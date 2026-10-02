import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { DrizzleModule } from '@lib/drizzle';
import { MemberRepository } from './member.repository';
import { MemberGuard } from './guard/member.guard';

@Module({
  imports: [DrizzleModule],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository, MemberGuard],
  exports: [MemberService, MemberGuard],
})
export class MemberModule {}
