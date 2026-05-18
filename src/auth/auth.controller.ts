import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import ms, { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtTokenDto } from './dto/res/token.dto';

@Controller('auth')
export class AuthController {
  private readonly refreshTokenExpire: number;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpire = ms(
      configService.getOrThrow<StringValue>('REFRESH_TOKEN_EXPIRE'),
    );
  }

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
  @ApiOAuth2(['email', 'profile', 'student_id', 'phone_number'], 'oauth2')
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenDto> {
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException();

    const { access_token, refresh_token } = await this.authService.login(auth);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + this.refreshTokenExpire),
      path: '/auth',
    });
    return { access_token };
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

    const { access_token, refresh_token, expiresAt } =
      await this.authService.refresh(refreshToken);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: expiresAt,
      path: '/auth',
    });

    return { access_token };
  }
}
