import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from '@lib/logger';
import { EditorModule } from './editor/editor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule,
    UserModule,
    EditorModule,
    HealthModule,
  ],
})
export class AppModule {}
