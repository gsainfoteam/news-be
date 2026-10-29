import {
  Body,
  Controller,
  Delete,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MemberGuard } from 'src/member/guard/member.guard';
import { NewspaperService } from './newspaper.service';
import { CreateNewspaperDto } from './dto/req/create-newspaper.dto';
import { CreateNewspaperFileUrlDto } from './dto/req/create-newspaper-file-url.dto';
import { SearchNewspapersDto } from './dto/req/search-newspapers.dto';
import { NewspaperDto } from './dto/res/newspaper.dto';
import { NewspaperListDto } from './dto/res/newspaper-list.dto';
import { NewspaperUploadUrlDto } from './dto/res/newspaper-upload-url.dto';

@ApiTags('newspaper')
@Controller('newspaper')
export class NewspaperController {
  constructor(private readonly newspaperService: NewspaperService) {}

  @ApiOperation({
    summary: 'Get Newspapers',
    description: 'Retrieve uploaded newspaper PDFs, newest first.',
  })
  @ApiOkResponse({
    description: 'The newspapers have been successfully retrieved.',
    type: NewspaperListDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get()
  async getNewspapers(
    @Query() query: SearchNewspapersDto,
  ): Promise<NewspaperListDto> {
    return await this.newspaperService.getNewspapers(query);
  }

  @ApiOperation({
    summary: 'Get Upload URL for Newspaper PDF',
    description:
      '[Author: Editor] Issue a presigned URL to upload a newspaper PDF. Pass the returned key in `fileKey` of `POST /newspaper`.',
  })
  @ApiCreatedResponse({
    description: 'The upload URL has been successfully issued.',
    type: NewspaperUploadUrlDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Post('file')
  async getNewspaperFileUploadUrl(
    @Body() body: CreateNewspaperFileUrlDto,
  ): Promise<NewspaperUploadUrlDto> {
    return await this.newspaperService.getUploadUrl(body);
  }

  @ApiOperation({
    summary: 'Create Newspaper',
    description:
      '[Author: Editor] Register an uploaded newspaper PDF. Upload the file with `POST /newspaper/file` first.',
  })
  @ApiCreatedResponse({
    description: 'The newspaper has been successfully created.',
    type: NewspaperDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'The file was not uploaded' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Post()
  async createNewspaper(
    @Body() body: CreateNewspaperDto,
  ): Promise<NewspaperDto> {
    return await this.newspaperService.createNewspaper(body);
  }

  @ApiOperation({
    summary: 'Delete Newspaper',
    description: '[Author: Editor] Delete a newspaper.',
  })
  @ApiOkResponse({
    description: 'The newspaper has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Delete(':id')
  async deleteNewspaper(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.newspaperService.deleteNewspaper(id);
  }
}
