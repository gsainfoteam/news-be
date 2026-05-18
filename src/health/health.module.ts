import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { DrizzleModule } from '@lib/drizzle';

@Module({
  imports: [DrizzleModule, TerminusModule.forRoot({ errorLogStyle: 'json' })],
  controllers: [HealthController],
})
export class HealthModule {}
