import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setTimeout } from 'timers/promises';
import { Loggable } from '@lib/logger';
import {
  ArticleEntity,
  Category,
  MemberEntity,
  UserEntity,
} from '@lib/drizzle';
import { ImageService } from '@lib/image';
import { StibeeService } from '@lib/stibee';
import { badgeColorOf, CATEGORY_LABEL } from '@lib/templates';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionDto } from './dto/res/subscription.dto';
import { groupRecipientsByCategory } from './group-recipients';

// 스티비 자동 이메일 API 제한이 초당 3회라 호출 사이를 띄운다
const STIBEE_AUTO_EMAIL_INTERVAL_MS = 350;

@Loggable()
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly webUrl: string;

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly stibeeService: StibeeService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
  ) {
    this.webUrl = this.configService.getOrThrow<string>('WEB_URL');
  }

  async getSubscriptions(user: UserEntity): Promise<SubscriptionDto> {
    return {
      categories: await this.subscriptionRepository.findSubscriptions(user.id),
    };
  }

  async subscribe(user: UserEntity, category: Category): Promise<void> {
    await this.stibeeService.addSubscriber(user.email);
    await this.subscriptionRepository.subscribe(user.id, category);
  }

  async unsubscribe(user: UserEntity, category: Category): Promise<void> {
    await this.subscriptionRepository.unsubscribe(user.id, category);
    const remaining = await this.subscriptionRepository.findSubscriptions(
      user.id,
    );
    if (remaining.length === 0) {
      await this.stibeeService.deleteSubscriber(user.email);
    }
  }

  async notifyNewArticle({
    article,
    authors,
  }: {
    article: ArticleEntity;
    authors: MemberEntity[];
  }): Promise<void> {
    try {
      const subscribers = await this.subscriptionRepository.findSubscribers(
        article.categories,
      );
      const groups = groupRecipientsByCategory(subscribers, article.categories);
      const imageKey = article.imageKeys?.[0];
      const fields = {
        title: article.title,
        subtitle: article.subtitle ?? '',
        authors: authors.map(({ name }) => name).join(', '),
        publishedAt: article.createdAt
          .toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
          .replaceAll('-', '.'),
        // 대표 이미지가 없으면 로고로 채운다.
        // TODO: FE에 로고가 아직 배포되지 않아 경로를 가정함, FE 배포 후 확인할 것
        imageUrl: imageKey
          ? this.imageService.getUrl(imageKey)
          : `${this.webUrl}/logo.png`,
        // TODO: FE에 기사 페이지가 아직 없어 경로를 가정함, FE 라우트가 정해지면 맞출 것
        articleUrl: `${this.webUrl}/article/${article.id}`,
      };

      for (const [category, emails] of groups) {
        for (const email of emails) {
          await this.stibeeService
            .sendAutoEmail(email, {
              ...fields,
              category: CATEGORY_LABEL[category],
              badgeColor: badgeColorOf(category),
            })
            .catch((error) =>
              this.logger.error(
                `failed to send article ${article.id} mail: ${error}`,
              ),
            );
          await setTimeout(STIBEE_AUTO_EMAIL_INTERVAL_MS);
        }
      }
    } catch (error) {
      this.logger.error(
        `failed to notify subscribers of article ${article.id}: ${error}`,
      );
    }
  }
}
