import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto): Promise<TokenPair> {
        const admin = await this.prisma.admin.findUnique({
            where: { username: dto.username },
        });

        // 계정 없음/비번 틀림을 동일 메시지로 처리 → 타이밍 공격 방어
        const isValid =
            admin !== null && (await bcrypt.compare(dto.password, admin.hashedPassword));

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokenPair(admin!.id, admin!.username);
    }

    async refresh(adminId: number, username: string): Promise<TokenPair> {
        // Refresh Token이 유효하면 새 토큰 쌍 발급
        return this.generateTokenPair(adminId, username);
    }

    private async generateTokenPair(id: number, username: string): Promise<TokenPair> {
        const payload = { sub: id, username };

        const [accessToken, refreshToken] = await Promise.all([
            // Access Token: 5분, JWT_ACCESS_SECRET
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '5m',
            }),
            // Refresh Token: 24h, JWT_REFRESH_SECRET (다른 secret 사용)
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '24h',
            }),
        ]);

        return { accessToken, refreshToken };
    }
}
