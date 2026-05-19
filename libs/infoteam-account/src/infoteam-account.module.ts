import { Module } from '@nestjs/common';
import { InfoteamAccountService } from './infoteam-account.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, ConfigModule, HttpModule, JwtModule],
  providers: [InfoteamAccountService],
  exports: [InfoteamAccountService],
})
export class InfoteamAccountModule {}
