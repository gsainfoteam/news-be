import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StibeeService } from './stibee.service';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [StibeeService],
  exports: [StibeeService],
})
export class StibeeModule {}
