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
    description: 'Issue JWT token.',
  })
  @ApiOkResponse({ description: 'Login success' })
  @ApiUnauthorizedResponse({ description: 'Invalid Infoteam Account token' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiOAuth2(['email', 'profile', 'student_id', 'phone_number'], 'oauth2')
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException();

    const { access_token, refresh_token } =
      await this.authService.userLogin(auth);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + this.refreshTokenExpire),
      path: '/auth',
    });
    return { access_token };
  }
}
