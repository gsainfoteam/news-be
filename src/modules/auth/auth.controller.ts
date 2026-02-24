import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({
        summary: '관리자 로그인',
        description: 'access_token(5분) + refresh_token(24h) 발급',
    })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Access Token 재발급',
        description: 'Authorization 헤더에 refresh_token을 담아 요청. 새 토큰 쌍 반환.',
    })
    refresh(@Request() req: { user: { id: number; username: string } }) {
        return this.authService.refresh(req.user.id, req.user.username);
    }
}
