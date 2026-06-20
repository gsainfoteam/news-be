import {
  DrizzleService,
  EditorEntity,
  existOrThrow,
  UserEntity,
} from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { editor, user } from 'drizzle/schema';

@Injectable()
export class EditorRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  SELECT *
  FROM editor
  WHERE deleted_at IS NULL;
  */
  async findEditors(): Promise<EditorEntity[]> {
    return this.drizzleService.db
      .select()
      .from(editor)
      .where(isNull(editor.deletedAt));
  }

  /*
  INSERT INTO editor (email)
  VALUES (emails);
  */
  async registerEditors(emails: string[]): Promise<void> {
    await this.drizzleService.db
      .insert(editor)
      .values(emails.map((email) => ({ email })));
  }

  /*
  SELECT *
  FROM user
  WHERE email IN (emails);
  */
  async findUsersByEmails(emails: string[]): Promise<UserEntity[]> {
    if (emails.length === 0) return [];
    return await this.drizzleService.db
      .select()
      .from(user)
      .where(inArray(user.email, emails));
  }

  /*
  UPDATE editor
  SET updated_at = NOW(), deleted_at = NOW()
  WHERE id = id AND deleted_at IS NULL;
  */
  async deleteEditor(id: string): Promise<void> {
    await this.drizzleService.db
      .update(editor)
      .set({ updatedAt: new Date(), deletedAt: new Date() })
      .where(and(eq(editor.id, id), isNull(editor.deletedAt)))
      .returning()
      .then(existOrThrow('Editor not found'));
  }

  /*
  UPDATE editor
  SET isEditorship = FALSE, updated_at = NOW()
  WHERE id = currentEditorShipId AND deleted_at IS NULL;

  UPDATE editor
  SET isEditorship = TRUE, updated_at = NOW()
  WHERE id = newEditorShipId AND deleted_at IS NULL;
  */
  async transferEditorship(
    currentEditorShipId: string,
    newEditorShipId: string,
  ): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      await tx
        .update(editor)
        .set({ isEditorship: false, updatedAt: new Date() })
        .where(
          and(eq(editor.id, currentEditorShipId), isNull(editor.deletedAt)),
        )
        .returning()
        .then(existOrThrow('Editor not found'));
      await tx
        .update(editor)
        .set({ isEditorship: true, updatedAt: new Date() })
        .where(and(eq(editor.id, newEditorShipId), isNull(editor.deletedAt)))
        .returning()
        .then(existOrThrow('Editor not found'));
    });
  }

  /*
  SELECT *
  FROM editor
  WHERE email = email
  LIMIT 1;
  */
  async findEditorByEmail(email: string): Promise<EditorEntity | null> {
    return this.drizzleService.db
      .select()
      .from(editor)
      .where(eq(editor.email, email))
      .limit(1)
      .then((row) => row[0]);
  }
}
