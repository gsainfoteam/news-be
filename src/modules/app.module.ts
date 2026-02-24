import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { ArticlesModule } from './articles/articles.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [DatabaseModule, ArticlesModule, HealthModule],
})
export class AppModule {}
