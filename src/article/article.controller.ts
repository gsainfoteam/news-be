import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CreatePresignedUrlDto } from './dto/req/create-presigned-url.dto';
import { UploadUrlInfoDto } from './dto/res/upload-url-info.dto';
import { UpdateArticleDto } from './dto/req/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({
    summary: 'Create Article',
    description: 'Create a new article.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully created.',
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
      'Retrieve a presigned URL and public URL for uploading an article image.',
  })
  @ApiOkResponse({
    description:
      'The presigned URL and public URL have been successfully retrieved.',
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
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get(':id')
  async getArticle(@Param('id', ParseIntPipe) id: number): Promise<ArticleDto> {
    return await this.articleService.getArticle(id);
  }

  @ApiOperation({
    summary: 'Update Article',
    description: 'Update an existing article.',
  })
  @ApiOkResponse({
    description: 'The article has been successfully updated.',
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
}
