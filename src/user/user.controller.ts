import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserEntity } from '@lib/drizzle';
import { GetUser } from './decorator/get-user.decorator';
import { UserDto } from './dto/res/user.dto';
import { RegisterUserDto } from './dto/req/register-user.dto';
import { JwtTokenDto } from 'src/auth/dto/res/token.dto';
import type { Response } from 'express';
import { UpdateNicknameDto } from './dto/req/update-nickname.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Register User',
    description: 'Register a new user.',
  })
  @ApiOkResponse({
    type: JwtTokenDto,
    description: 'The user has been successfully registered.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @Post()
  async registerUser(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterUserDto,
  ): Promise<JwtTokenDto> {
    const { accessToken, refreshToken, expiresAt } =
      await this.userService.registerUser(body);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: expiresAt,
      path: '/auth',
    });
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Get Current User',
    description: 'Retrieve the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'The user profile has been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@GetUser() user: UserEntity): Promise<UserDto> {
    return await this.userService.getMe(user);
  }

  @ApiOperation({
    summary: 'Update Nickname',
    description: 'Update the nickname of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'The user profile has been successfully updated.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Patch('nickname')
  async updateNickname(
    @GetUser() user: UserEntity,
    @Body() body: UpdateNicknameDto,
  ): Promise<void> {
    await this.userService.updateNickname(user, body);
  }
}
