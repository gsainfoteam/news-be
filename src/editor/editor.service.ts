import { Injectable } from '@nestjs/common';
import { EditorRepository } from './editor.repository';
import { Loggable } from '@lib/logger';
import { EditorDto } from './dto/res/editor.dto';
import { EditorEntity } from '@lib/drizzle';

@Loggable()
@Injectable()
export class EditorService {
  constructor(private readonly editorRepository: EditorRepository) {}

  async findEditors(): Promise<EditorDto[]> {
    const editors = await this.editorRepository.findEditors();
    const users = await this.editorRepository.findUsersByEmails(
      editors.map((editor) => editor.email),
    );
    return editors.map(
      (editor) =>
        new EditorDto(
          editor,
          users.find((user) => user.email === editor.email) ?? null,
        ),
    );
  }

  async registerEditors(emails: string[]): Promise<void> {
    return await this.editorRepository.registerEditors(emails);
  }

  async findEditorByEmail(email: string): Promise<EditorEntity | null> {
    return await this.editorRepository.findEditorByEmail(email);
  }

  async deleteEditor(id: string): Promise<void> {
    await this.editorRepository.deleteEditor(id);
  }
}
