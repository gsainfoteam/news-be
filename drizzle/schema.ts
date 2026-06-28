import { sql } from 'drizzle-orm';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  nickname: text('nickname'),
  termsAgreedAt: timestamp('terms_agreed_at'),
  privacyAgreedAt: timestamp('privacy_agreed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const refreshToken = pgTable('refresh_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const editor = pgTable(
  'editor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    isEditorship: boolean('is_editorship').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('editor_email_unique_idx')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
