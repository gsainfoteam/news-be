import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Access Token Guard - API 엔드포인트 보호 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') { }

/** Refresh Token Guard - /auth/refresh 전용 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') { }
