CREATE TABLE "newspaper" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
