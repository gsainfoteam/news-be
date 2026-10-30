CREATE TABLE "newspaper" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newspaper_file_key_unique" UNIQUE("file_key")
);
