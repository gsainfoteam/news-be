import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repository';
import { DrizzleModule } from '@lib/drizzle';
import { ImageModule } from '@lib/image';
import { MailModule } from '@lib/mail';
import { TemplatesModule } from '@lib/templates';

@Module({
  imports: [DrizzleModule, ImageModule, MailModule, TemplatesModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
