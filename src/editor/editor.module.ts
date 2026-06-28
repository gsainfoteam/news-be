import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { DrizzleModule } from '@lib/drizzle';
import { EditorRepository } from './editor.repository';
import { EditorGuard } from './guard/editor.guard';

@Module({
  imports: [DrizzleModule],
  controllers: [EditorController],
  providers: [EditorService, EditorRepository, EditorGuard],
  exports: [EditorService],
})
export class EditorModule {}
