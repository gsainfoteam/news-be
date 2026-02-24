import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
    sub: number;
    username: string;
}

/** Access Token 검증 전략 (Authorization: Bearer <access_token>) */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET!,
        });
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, username: payload.username };
    }
}

/** Refresh Token 검증 전략 (Authorization: Bearer <refresh_token>) */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET!,
        });
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, username: payload.username };
    }
}
