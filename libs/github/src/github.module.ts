import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { GithubService } from './github.service';

@Module({
  imports: [HttpModule.register({ timeout: 5000 }), JwtModule.register({})],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
