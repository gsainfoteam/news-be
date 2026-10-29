import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ReportEntity } from '@lib/drizzle';
import { FileService } from '@lib/file';
import { Loggable } from '@lib/logger';
import { ReportRepository } from './report.repository';
import { CreateReportDto } from './dto/req/create-report.dto';
import { CreateReportFileUrlDto } from './dto/req/create-report-file-url.dto';
import { SearchReportsDto } from './dto/req/search-reports.dto';
import { ReportDto } from './dto/res/report.dto';
import { ReportListDto } from './dto/res/report-list.dto';
import { ReportUploadUrlDto } from './dto/res/report-upload-url.dto';
import { REPORT_FILE_CONTENT_TYPES } from './report.policy';

@Loggable()
@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly fileService: FileService,
  ) {}

  async getUploadUrl({
    fileName,
    contentLength,
  }: CreateReportFileUrlDto): Promise<ReportUploadUrlDto> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const contentType = REPORT_FILE_CONTENT_TYPES[ext];
    if (!contentType)
      throw new BadRequestException(`File extension .${ext} is not allowed`);

    // 키를 추측할 수 없도록 서버에서 UUID 경로를 만든다
    const key = `report/${randomUUID()}/${fileName}`;
    return new ReportUploadUrlDto(
      await this.fileService.createPresignedUrl(
        key,
        contentLength,
        contentType,
      ),
      key,
    );
  }

  async createReport(body: CreateReportDto): Promise<void> {
    if (body.fileKeys) {
      await Promise.all(
        body.fileKeys.map((key) => this.fileService.verifyFileExist(key)),
      );
    }
    await this.reportRepository.createReport(body);
  }

  async getReports(query: SearchReportsDto): Promise<ReportListDto> {
    const [reports, count] = await Promise.all([
      this.reportRepository.findReports(query),
      this.reportRepository.countReports(),
    ]);
    return new ReportListDto(
      await Promise.all(reports.map((report) => this.toReportDto(report))),
      count,
    );
  }

  async getReport(id: number): Promise<ReportDto> {
    return await this.toReportDto(await this.reportRepository.getReport(id));
  }

  private async toReportDto(report: ReportEntity): Promise<ReportDto> {
    const files = await Promise.all(
      report.fileKeys.map(async (key) => ({
        name: key.split('/').pop() ?? key,
        url: await this.fileService.createPresignedGetUrl(key),
      })),
    );
    return new ReportDto(report, files);
  }
}
