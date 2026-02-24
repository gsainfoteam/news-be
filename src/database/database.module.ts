import { Global, Module } from '@nestjs/common';

import { DrizzleService } from './drizzle.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, DrizzleService],
  exports: [PrismaService, DrizzleService],
})
export class DatabaseModule {}
