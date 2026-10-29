import {
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { Category, UserEntity } from '@lib/drizzle';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/res/subscription.dto';

@Controller('user/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({
    summary: 'Get Category Subscriptions',
    description:
      'Retrieve the categories the currently authenticated user subscribes to.',
  })
  @ApiOkResponse({
    type: SubscriptionDto,
    description: 'The subscriptions have been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Get()
  async getSubscriptions(
    @GetUser() user: UserEntity,
  ): Promise<SubscriptionDto> {
    return await this.subscriptionService.getSubscriptions(user);
  }

  @ApiOperation({
    summary: 'Subscribe Category',
    description:
      'Subscribe the currently authenticated user to a category. ' +
      'Subscribing to an already subscribed category is a no-op.',
  })
  @ApiParam({ name: 'category', enum: Category })
  @ApiCreatedResponse({
    description: 'The category has been successfully subscribed.',
  })
  @ApiBadRequestResponse({ description: 'Invalid category' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Post(':category')
  async subscribe(
    @GetUser() user: UserEntity,
    @Param('category', new ParseEnumPipe(Category)) category: Category,
  ): Promise<void> {
    await this.subscriptionService.subscribe(user, category);
  }

  @ApiOperation({
    summary: 'Unsubscribe Category',
    description:
      'Unsubscribe the currently authenticated user from a category. ' +
      'Unsubscribing from a not subscribed category is a no-op.',
  })
  @ApiParam({ name: 'category', enum: Category })
  @ApiOkResponse({
    description: 'The category has been successfully unsubscribed.',
  })
  @ApiBadRequestResponse({ description: 'Invalid category' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Delete(':category')
  async unsubscribe(
    @GetUser() user: UserEntity,
    @Param('category', new ParseEnumPipe(Category)) category: Category,
  ): Promise<void> {
    await this.subscriptionService.unsubscribe(user, category);
  }
}
