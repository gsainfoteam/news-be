import { Injectable } from '@nestjs/common';
import { EditorRepository } from './editor.repository';
import { EditorEntity } from '@lib/drizzle';
import { Loggable } from '@lib/logger';

@Loggable()
@Injectable()
export class EditorService {
  constructor(private readonly editorRepository: EditorRepository) {}

  async findEditorByEmail(email: string): Promise<EditorEntity | null> {
    return await this.editorRepository.findEditorByEmail(email);
  }
}
