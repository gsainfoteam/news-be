import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { CreatePresignedUrlDto } from './dto/req/create-presigned-url.dto';
import { UploadUrlInfoDto } from './dto/res/upload-url-info.dto';
import { UpdateArticleDto } from './dto/req/update-article.dto';
import { SearchArticlesDto } from './dto/req/search-articles.dto';
import { GetArticleDto } from './dto/req/get-article.dto';
import { ArticleListDto } from './dto/res/article-list.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({
    summary: 'Get Articles List',
    description: 'Retrieve a list of articles.',
  })
  @ApiOkResponse({
    description: 'The articles have been successfully retrieved.',
    type: ArticleListDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get()
  async getArticles(
    @Query() query: SearchArticlesDto,
  ): Promise<ArticleListDto> {
    return await this.articleService.getArticles(query);
  }

  @ApiOperation({
    summary: 'Create Article',
    description: '[Author: Editor] Create a new article.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully created.',
    type: ArticleDto,
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
  ): Promise<ArticleDto> {
    return await this.articleService.createArticle(editor.id, body);
  }

  @ApiOperation({
    summary: 'Get Upload URL',
    description:
      '[Author: Editor] Retrieve a presigned URL and public URL for uploading an article image.',
  })
  @ApiOkResponse({
    description:
      'The presigned URL and public URL have been successfully retrieved.',
    type: UploadUrlInfoDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Post('image')
  async getUploadUrl(
    @Body() body: CreatePresignedUrlDto,
  ): Promise<UploadUrlInfoDto> {
    return await this.articleService.getUploadUrl(body);
  }

  @ApiOperation({
    summary: 'Get Article',
    description: 'Retrieve an article by its ID.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully retrieved.',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get(':id')
  async getArticle(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetArticleDto,
  ): Promise<ArticleDto> {
    return await this.articleService.getArticle(id, query);
  }

  @ApiOperation({
    summary: 'Update Article',
    description: '[Author: Editor] Update an existing article.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully updated.',
    type: ArticleDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Patch(':id')
  async updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ): Promise<ArticleDto> {
    return await this.articleService.updateArticle(id, body);
  }

  @ApiOperation({
    summary: 'Delete Article',
    description: '[Author: Editor] Delete an existing article.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(EditorGuard)
  @Delete(':id')
  async deleteArticle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.articleService.deleteArticle(id);
  }
}
