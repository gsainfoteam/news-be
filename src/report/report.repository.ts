import { DrizzleService, ReportEntity, existOrThrow } from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { report } from 'drizzle/schema';
import { CreateReportDto } from './dto/req/create-report.dto';
import { SearchReportsDto } from './dto/req/search-reports.dto';

@Injectable()
export class ReportRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  INSERT INTO report (name, email, phone, title, description, file_keys) VALUES (...);
  */
  async createReport({ fileKeys, ...values }: CreateReportDto): Promise<void> {
    await this.drizzleService.db
      .insert(report)
      .values({ ...values, fileKeys: fileKeys ?? [] });
  }

  /*
  SELECT * FROM report
  ORDER BY created_at DESC, id DESC
  LIMIT limit OFFSET offset;
  */
  async findReports({
    offset,
    limit,
  }: SearchReportsDto): Promise<ReportEntity[]> {
    return await this.drizzleService.db
      .select()
      .from(report)
      .orderBy(desc(report.createdAt), desc(report.id))
      .limit(limit)
      .offset(offset);
  }

  /*
  SELECT COUNT(*) FROM report;
  */
  async countReports(): Promise<number> {
    return await this.drizzleService.db
      .select({ count: count() })
      .from(report)
      .then((result) => result[0].count);
  }

  /*
  SELECT * FROM report WHERE id = id;
  */
  async getReport(id: number): Promise<ReportEntity> {
    return await this.drizzleService.db
      .select()
      .from(report)
      .where(eq(report.id, id))
      .then(existOrThrow('Report not found'));
  }
}
