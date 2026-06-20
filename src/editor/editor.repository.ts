import { DrizzleService, EditorEntity } from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { editor } from 'drizzle/schema';

@Injectable()
export class EditorRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findEditors(): Promise<EditorEntity[]> {
    return this.drizzleService.db
      .select()
      .from(editor)
      .where(isNull(editor.deletedAt));
  }

  async findEditorByEmail(email: string): Promise<EditorEntity | null> {
    return this.drizzleService.db
      .select()
      .from(editor)
      .where(eq(editor.email, email))
      .limit(1)
      .then((row) => row[0]);
  }
}
