import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: '기사 목록 조회' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  list(@Query() query: ListArticlesQueryDto) {
    return this.articlesService.list(query);
  }

  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록 조회' })
  listCategories() {
    return this.articlesService.listCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: '기사 상세 조회' })
  @ApiParam({ name: 'id', type: Number })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.get(id);
  }

  @Post()
  @ApiOperation({ summary: '기사 생성' })
  create(@Body() payload: CreateArticleDto) {
    return this.articlesService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: '기사 수정' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateArticleDto) {
    return this.articlesService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: '기사 삭제' })
  @ApiParam({ name: 'id', type: Number })
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.articlesService.remove(id);
  }
}
