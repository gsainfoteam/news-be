import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Loggable } from '@lib/logger';
import {
  ArticleEntity,
  Category,
  MemberEntity,
  UserEntity,
} from '@lib/drizzle';
import { ImageService } from '@lib/image';
import { MailService } from '@lib/mail';
import { TemplatesService } from '@lib/templates';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionDto } from './dto/res/subscription.dto';
import { groupRecipientsByCategory } from './group-recipients';

@Loggable()
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly webUrl: string;

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly mailService: MailService,
    private readonly templatesService: TemplatesService,
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
    await this.subscriptionRepository.subscribe(user.id, category);
  }

  async unsubscribe(user: UserEntity, category: Category): Promise<void> {
    await this.subscriptionRepository.unsubscribe(user.id, category);
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
      const imageUrl = imageKey ? this.imageService.getUrl(imageKey) : null;
      const publishedAt = article.createdAt
        .toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
        .replaceAll('-', '.');

      for (const [category, emails] of groups) {
        const html = await this.templatesService.renderNewArticle({
          category,
          title: article.title,
          subtitle: article.subtitle,
          authors: authors.map(({ name }) => name).join(', '),
          publishedAt,
          imageUrl,
          // TODO: FE에 기사/구독 설정 페이지가 아직 없어 경로를 가정함, FE 라우트가 정해지면 맞출 것
          articleUrl: `${this.webUrl}/article/${article.id}`,
          homeUrl: this.webUrl,
          settingsUrl: `${this.webUrl}/subscription`,
          logoUrl: `${this.webUrl}/logo.png`,
        });
        for (const email of emails) {
          await this.mailService
            .sendEmail(email, article.title, html)
            .catch((error) =>
              this.logger.error(
                `failed to send article ${article.id} mail: ${error}`,
              ),
            );
        }
      }
    } catch (error) {
      this.logger.error(
        `failed to notify subscribers of article ${article.id}: ${error}`,
      );
    }
  }
}
