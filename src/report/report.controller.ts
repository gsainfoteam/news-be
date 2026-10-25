import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Permission } from '@lib/drizzle';
import { MemberGuard } from 'src/member/guard/member.guard';
import { RequiredPermission } from 'src/member/decorator/permission.decorator';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/req/create-report.dto';
import { CreateReportFileUrlDto } from './dto/req/create-report-file-url.dto';
import { SearchReportsDto } from './dto/req/search-reports.dto';
import { ReportDto } from './dto/res/report.dto';
import { ReportListDto } from './dto/res/report-list.dto';
import { ReportUploadUrlDto } from './dto/res/report-upload-url.dto';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({
    summary: 'Get Upload URL for Report File',
    description:
      '[Author: Anyone] Issue a presigned URL to upload a file attached to a report. Pass the returned key in `fileKeys` of `POST /report`. The file is private and can only be read by members. Limited to 20 requests per minute per IP.',
  })
  @ApiCreatedResponse({
    description: 'The upload URL has been successfully issued.',
    type: ReportUploadUrlDto,
  })
  @ApiBadRequestResponse({ description: 'File extension is not allowed' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  @Post('file')
  async getUploadUrl(
    @Body() body: CreateReportFileUrlDto,
  ): Promise<ReportUploadUrlDto> {
    return await this.reportService.getUploadUrl(body);
  }

  @ApiOperation({
    summary: 'Create Report',
    description:
      '[Author: Anyone] Submit a news tip. No login is required. Limited to 5 requests per minute per IP.',
  })
  @ApiCreatedResponse({
    description: 'The report has been successfully submitted.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'An attached file was not uploaded' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @UseGuards(ThrottlerGuard)
  @Post()
  async createReport(@Body() body: CreateReportDto): Promise<void> {
    await this.reportService.createReport(body);
  }

  @ApiOperation({
    summary: 'Get Reports',
    description:
      '[Author: Member] Retrieve submitted reports, newest first. Any member except ALUMNI can read them. File URLs expire in 10 minutes.',
  })
  @ApiOkResponse({
    description: 'The reports have been successfully retrieved.',
    type: ReportListDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.NONE)
  @UseGuards(MemberGuard)
  @Get()
  async getReports(@Query() query: SearchReportsDto): Promise<ReportListDto> {
    return await this.reportService.getReports(query);
  }

  @ApiOperation({
    summary: 'Get Report',
    description:
      '[Author: Member] Retrieve a report by its ID. Any member except ALUMNI can read it. File URLs expire in 10 minutes.',
  })
  @ApiOkResponse({
    description: 'The report has been successfully retrieved.',
    type: ReportDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.NONE)
  @UseGuards(MemberGuard)
  @Get(':id')
  async getReport(@Param('id', ParseIntPipe) id: number): Promise<ReportDto> {
    return await this.reportService.getReport(id);
  }
}
