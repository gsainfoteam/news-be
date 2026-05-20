import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserEntity } from '@lib/drizzle';
import { GetUser } from './decorator/get-user.decorator';
import { UserDto } from './dto/res/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Get Current User',
    description: 'Retrieve the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'The user profile has been successfully retrieved.',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@GetUser() user: UserEntity): Promise<UserDto> {
    return await this.userService.getMe(user);
  }
}
