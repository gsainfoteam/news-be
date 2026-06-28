import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
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
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { UserEntity } from '@lib/drizzle';

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

  @ApiOperation({
    summary: 'Delete Editor',
    description: 'Soft delete an editor by recording the deletedAt timestamp.',
  })
  @ApiOkResponse({
    description: 'The editor has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredRole(Role.EDITORSHIP)
  @UseGuards(EditorGuard)
  @Delete(':id')
  async deleteEditor(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.editorService.deleteEditor(id);
  }

  @ApiOperation({
    summary: 'Transfer Editorship',
    description: 'Transfer editorship to a different user.',
  })
  @ApiOkResponse({
    description: 'The editorship has been successfully transferred.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredRole(Role.EDITORSHIP)
  @UseGuards(EditorGuard)
  @Post(':id/editorship')
  async transferEditorship(
    @GetUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const curEditorship = await this.editorService.findEditorByEmail(
      user.email,
    );
    if (!curEditorship || !curEditorship.isEditorship)
      throw new ForbiddenException('Current user is not an editorship');
    await this.editorService.transferEditorship(curEditorship.id, id);
  }
}
