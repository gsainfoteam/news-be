import { Category } from '../libs/drizzle/src/enum';
import { sql } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';
import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

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
    name: text('name').notNull(),
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

export const category = pgEnum(
  'category',
  Object.values(Category) as [string, ...string[]],
);

export const article = pgTable('article', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageKeys: text('image_keys').array(),
  views: integer('views').default(0).notNull(),
  categories: category('categories').array().$type<Category[]>().notNull(),
  editorId: uuid('editor_id')
    .notNull()
    .references(() => editor.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
