import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/req/update-about.dto';
import { CreateHistoryDto } from './dto/req/create-history.dto';
import { UpdateHistoryDto } from './dto/req/update-history.dto';
import { AboutDto } from './dto/res/about.dto';
import { HistoryDto } from './dto/res/history.dto';

@ApiTags('about')
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @ApiOperation({
    summary: 'Get About',
    description: 'Retrieve the newspaper introduction and its history.',
  })
  @ApiOkResponse({
    description: 'The about information has been successfully retrieved.',
    type: AboutDto,
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get()
  async getAbout(): Promise<AboutDto> {
    return await this.aboutService.getAbout();
  }

  @ApiOperation({
    summary: 'Update About',
    description: '[Author: Editor] Update the newspaper introduction.',
  })
  @ApiOkResponse({
    description: 'The about information has been successfully updated.',
    type: AboutDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Patch()
  async updateAbout(@Body() body: UpdateAboutDto): Promise<AboutDto> {
    return await this.aboutService.updateAbout(body);
  }

  @ApiOperation({
    summary: 'Create History',
    description: '[Author: Editor] Add a history entry.',
  })
  @ApiCreatedResponse({
    description: 'The history has been successfully created.',
    type: HistoryDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Post('history')
  async createHistory(@Body() body: CreateHistoryDto): Promise<HistoryDto> {
    return await this.aboutService.createHistory(body);
  }

  @ApiOperation({
    summary: 'Update History',
    description: '[Author: Editor] Update a history entry.',
  })
  @ApiOkResponse({
    description: 'The history has been successfully updated.',
    type: HistoryDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Patch('history/:id')
  async updateHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHistoryDto,
  ): Promise<HistoryDto> {
    return await this.aboutService.updateHistory(id, body);
  }

  @ApiOperation({
    summary: 'Delete History',
    description: '[Author: Editor] Delete a history entry.',
  })
  @ApiOkResponse({ description: 'The history has been successfully deleted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Delete('history/:id')
  async deleteHistory(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.aboutService.deleteHistory(id);
  }
}
