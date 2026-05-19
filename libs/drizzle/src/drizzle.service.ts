import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from 'drizzle/schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public readonly db: PostgresJsDatabase<typeof schema>;
  private readonly client: postgres.Sql;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
    this.client = postgres(databaseUrl);
    this.db = drizzle(this.client, { schema });
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
