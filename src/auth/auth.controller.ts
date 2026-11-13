import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { JwtTokenDto } from './dto/res/token.dto';
import { LoginDto } from './dto/req/login.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'User Login',
    description:
      'Exchange the Infoteam Account authorization code and issue a JWT token.\n' +
      'A user who has not agreed to the terms gets 403 `session_rejected` with a `ticket`, and logs in again with `{ ticket, nickname }` to sign up.',
  })
  @ApiOkResponse({ type: JwtTokenDto, description: 'Login success' })
  @ApiUnauthorizedResponse({ description: 'Invalid code or ticket' })
  @ApiForbiddenResponse({ description: 'Consent required' })
  @ApiBadGatewayResponse({ description: 'IdP unavailable' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenDto> {
    // news has no app, so the refresh token only travels in the cookie
    if (body.transport === 'body')
      throw new BadRequestException('transport body is not supported');
    const { accessToken, refreshToken, expiresAt } =
      body.ticket === undefined
        ? await this.authService.login(body)
        : await this.userService.registerUser({
            tempToken: body.ticket,
            nickname: body.nickname,
          });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: expiresAt,
      path: '/auth',
    });
    return { access_token: accessToken! };
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh the access token for user',
  })
  @ApiOkResponse({ type: JwtTokenDto, description: 'Return jwt token' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenDto> {
    const refreshToken = req.cookies['refresh_token'] as string;
    if (!refreshToken) throw new UnauthorizedException();

    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    } = await this.authService.refresh(refreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: expiresAt,
      path: '/auth',
    });
    return { access_token: accessToken! };
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Logout the user from the cookie. Delete the refresh token.',
  })
  @ApiOkResponse({ description: 'Logout' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies['refresh_token'] as string;
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth',
    });
    if (refreshToken) await this.authService.logout(refreshToken);
  }
}
