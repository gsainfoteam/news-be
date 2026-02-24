import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: varchar('summary', { length: 500 }),
  content: text('content').notNull(),
  author: varchar('author', { length: 120 }),
  category: varchar('category', { length: 120 }),
  source: varchar('source', { length: 255 }),
  imageUrl: varchar('image_url', { length: 500 }),
  publishedAt: timestamp('published_at', { withTimezone: false }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).notNull(),
});
