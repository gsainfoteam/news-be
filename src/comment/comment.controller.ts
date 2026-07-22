import {
  Body,
  Controller,
  Delete,
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
import { CommentService } from './comment.service';
import { CommentDto } from './dto/res/comment.dto';
import { CreateCommentDto } from './dto/req/create-comment.dto';
import { UpdateCommentDto } from './dto/req/update-comment.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { UserEntity } from '@lib/drizzle';

@Controller('article/:articleId/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    summary: 'Create Comment',
    description: 'Create a new comment on an article.',
  })
  @ApiOkResponse({
    description: 'The comment has been successfully created.',
    type: CommentDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Post()
  async createComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @GetUser() user: UserEntity,
    @Body() body: CreateCommentDto,
  ): Promise<CommentDto> {
    return await this.commentService.createComment(articleId, user.id, body);
  }

  @ApiOperation({
    summary: 'Update Comment',
    description: '[Author only] Update an existing comment.',
  })
  @ApiOkResponse({
    description: 'The comment has been successfully updated.',
    type: CommentDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Patch(':commentId')
  async updateComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: UserEntity,
    @Body() body: UpdateCommentDto,
  ): Promise<CommentDto> {
    return await this.commentService.updateComment(
      articleId,
      commentId,
      user.id,
      body,
    );
  }

  @ApiOperation({
    summary: 'Delete Comment',
    description: '[Author or Editor] Delete an existing comment.',
  })
  @ApiOkResponse({
    description: 'The comment has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    await this.commentService.deleteComment(articleId, commentId, user);
  }
}
