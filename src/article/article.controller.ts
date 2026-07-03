import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { ArticleService } from './article.service';
import { ArticleDto } from './dto/res/article.dto';
import { CreateArticleDto } from './dto/req/create-article.dto';
import { EditorGuard } from 'src/editor/guard/editor.guard';
import { GetEditor } from 'src/editor/decorator/get-editor.decorator';
import { EditorEntity } from '@lib/drizzle';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({
    summary: 'Get Article',
    description: 'Retrieve an article by its ID.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Post()
  async createArticle(
    @GetEditor() editor: EditorEntity,
    @Body() body: CreateArticleDto,
  ): Promise<void> {
    await this.articleService.createArticle(editor.id, body);
  }

  @ApiOperation({
    summary: 'Get Article',
    description: 'Retrieve an article by its ID.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get(':id')
  async getArticle(@Param('id', ParseIntPipe) id: number): Promise<ArticleDto> {
    return await this.articleService.getArticle(id);
  }
}
