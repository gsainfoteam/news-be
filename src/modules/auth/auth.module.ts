import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy, JwtRefreshStrategy } from './jwt.strategy';

@Module({
    imports: [
        PassportModule,
        // JwtModule은 signAsync 시 직접 secret을 전달하므로 기본 등록만
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule { }
