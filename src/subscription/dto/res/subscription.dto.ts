import { Category } from '@lib/drizzle';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({
    description: 'subscribed categories',
    example: [Category.CAMPUS, Category.CULTURE],
    enum: Category,
    isArray: true,
  })
  categories!: Category[];
}
