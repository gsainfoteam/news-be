import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ArticleService } from './article.service';

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
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get(':id')
  async getArticle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.articleService.getArticle(id);
  }
}
