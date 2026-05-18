import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  profile: text('profile'),
  nickname: text('nickname'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
