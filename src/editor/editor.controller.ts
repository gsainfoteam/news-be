import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EditorGuard } from './guard/editor.guard';
import { EditorService } from './editor.service';
import { RegisterEditorsDto } from './dto/req/register-editors.dto';
import { RequiredRole } from './decorator/role.decorator';
import { Role } from 'src/user/enum/role.enum';
import { EditorDto } from './dto/res/editor.dto';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @ApiOperation({
    summary: 'Get Current Editor Profile',
    description: 'Retrieve the profile of the currently authenticated editor.',
  })
  @ApiOkResponse({
    type: [EditorDto],
    description: 'The editor profile has been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Get()
  async getEditors(): Promise<EditorDto[]> {
    return await this.editorService.findEditors();
  }

  @ApiOperation({
    summary: 'Register Editors',
    description: 'Register a new editor.',
  })
  @ApiOkResponse({
    description: 'The editor has been successfully registered.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredRole(Role.EDITORSHIP)
  @UseGuards(EditorGuard)
  @Post()
  async registerEditors(@Body() { emails }: RegisterEditorsDto): Promise<void> {
    await this.editorService.registerEditors(emails);
  }
}
