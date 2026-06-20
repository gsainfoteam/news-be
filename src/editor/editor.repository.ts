import { DrizzleService, EditorEntity, UserEntity } from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { eq, inArray, isNull } from 'drizzle-orm';
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
  SELECT *
  FROM user
  WHERE email = email
  LIMIT 1;
  */
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.drizzleService.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
      .then((res) => res[0] ?? null);
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
