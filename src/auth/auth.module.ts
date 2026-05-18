import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { InfoteamAccountModule } from '@lib/infoteam-account';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { AuthRepository } from './auth.repository';
import { DrizzleModule } from '@lib/drizzle';

@Module({
  imports: [
    InfoteamAccountModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            ms(configService.getOrThrow<StringValue>('JWT_EXPIRE')) / 1000,
          algorithm: 'HS256',
          audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
          issuer: configService.getOrThrow<string>('JWT_ISSUER'),
        },
      }),
    }),
    DrizzleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
