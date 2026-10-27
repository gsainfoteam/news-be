import { Injectable } from '@nestjs/common';
import { Loggable } from '@lib/logger';
import { Category, UserEntity } from '@lib/drizzle';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionDto } from './dto/res/subscription.dto';

@Loggable()
@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getSubscriptions(user: UserEntity): Promise<SubscriptionDto> {
    return {
      categories: await this.subscriptionRepository.findSubscriptions(user.id),
    };
  }

  async subscribe(user: UserEntity, category: Category): Promise<void> {
    await this.subscriptionRepository.subscribe(user.id, category);
  }

  async unsubscribe(user: UserEntity, category: Category): Promise<void> {
    await this.subscriptionRepository.unsubscribe(user.id, category);
  }
}
