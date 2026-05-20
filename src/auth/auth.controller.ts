import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { JwtTokenDto } from './dto/res/token.dto';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User Login',
    description:
      'Issue JWT token. User must provide a valid Infoteam Account OpenID Token in the Authorization header.',
  })
  @ApiOkResponse({ type: JwtTokenDto, description: 'Login success' })
  @ApiUnauthorizedResponse({
    description: 'Invalid Infoteam Account OpenID Token',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiOAuth2(['name', 'email', 'picture'], 'oauth2')
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenDto> {
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException();

    const { accessToken, refreshToken, tempToken, expiresAt } =
      await this.authService.login(auth);

    if (tempToken) return { tempToken };

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
    summary: 'Refresh token',
    description: 'Refresh the access token for user',
  })
  @ApiOkResponse({ type: JwtTokenDto, description: 'Return jwt token' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Post('refresh')
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
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Logout the user from the cookie. Delete the refresh token.',
  })
  @ApiOkResponse({ description: 'Logout' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies['refresh_token'] as string;
    if (!refreshToken) return;
    await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token', {
      path: '/auth',
    });
  }
}
