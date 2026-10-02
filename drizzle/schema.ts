import { Category, Permission, Role } from '../libs/drizzle/src/enum';
import { sql } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const category = pgEnum(
  'category',
  Object.values(Category) as [string, ...string[]],
);

export const role = pgEnum(
  'role',
  Object.values(Role) as [string, ...string[]],
);

export const permission = pgEnum(
  'permission',
  Object.values(Permission) as [string, ...string[]],
);

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

export const member = pgTable(
  'member',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    // 직책 (FE 신문사 명단 표기용)
    role: role('role').$type<Role>().default(Role.CUB_REPORTER).notNull(),
    // 권한 (BE 권한 제어용)
    permission: permission('permission')
      .$type<Permission>()
      .default(Permission.NONE)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('member_email_unique_idx')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

export const article = pgTable('article', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  content: text('content').notNull(),
  imageKeys: text('image_keys').array(),
  views: integer('views').default(0).notNull(),
  categories: category('categories').array().$type<Category[]>().notNull(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => member.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const comment = pgTable('comment', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  articleId: integer('article_id')
    .notNull()
    .references(() => article.id),
  parentId: integer('parent_id').references((): AnyPgColumn => comment.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
