import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DrizzleModule } from '@lib/drizzle';
import { ImageModule } from '@lib/image';
import { MemberModule } from 'src/member/member.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';

@Module({
  imports: [
    DrizzleModule,
    ImageModule,
    MemberModule,
    // 로그인 없이 받는 제보의 도배를 막는다. 기본값은 IP당 1분에 5번
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
