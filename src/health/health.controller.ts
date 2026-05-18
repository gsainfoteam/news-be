import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DrizzleService } from 'libs/drizzle/drizzle.service';
import { sql } from 'drizzle-orm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly drizzleService: DrizzleService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @ApiOperation({
    summary: 'Health check for the application',
    description: 'Check the health of the application',
  })
  @Get()
  @HealthCheck()
  async check() {
    return await this.health.check([
      async () => {
        const indicator = this.healthIndicatorService.check('database');
        try {
          await this.drizzleService.db.execute(sql`SELECT 1`);
          return indicator.up();
        } catch (error) {
          return indicator.down({ message: (error as Error).message });
        }
      },
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 200),
    ]);
  }
}
