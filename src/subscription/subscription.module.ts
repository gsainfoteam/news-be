import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repository';
import { DrizzleModule } from '@lib/drizzle';
import { FileModule } from '@lib/file';
import { StibeeModule } from '@lib/stibee';

@Module({
  imports: [DrizzleModule, FileModule, StibeeModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
