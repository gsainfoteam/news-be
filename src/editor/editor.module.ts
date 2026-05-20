import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { DrizzleModule } from '@lib/drizzle';
import { EditorRepository } from './editor.repository';

@Module({
  imports: [DrizzleModule],
  controllers: [EditorController],
  providers: [EditorService, EditorRepository],
  exports: [EditorService],
})
export class EditorModule {}
