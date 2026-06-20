import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EditorGuard } from './guard/editor.guard';
import { EditorService } from './editor.service';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @ApiOperation({
    summary: 'Get Current Editor Profile',
    description: 'Retrieve the profile of the currently authenticated editor.',
  })
  @ApiOkResponse({
    description: 'The editor profile has been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Get()
  async getEditors(): Promise<void> {
    await this.editorService.findEditors();
  }
}
