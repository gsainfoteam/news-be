CREATE TYPE "public"."category" AS ENUM('CAMPUS', 'SOCIETY', 'ACADEMIC_RESEARCH', 'ACADEMIC', 'RESEARCH', 'CULTURE', 'PLANNING_SPECIAL', 'PLANNING', 'SPECIAL', 'REPORTAGE', 'OPINION', 'INTERNAL_COLUMN', 'EXTERNAL_COLUMN', 'READERS_COMMITTEE', 'CARTOON');--> statement-breakpoint
CREATE TABLE "article" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image_keys" text[],
	"views" integer DEFAULT 0 NOT NULL,
	"categories" "category"[] NOT NULL,
	"editor_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "editor" ADD COLUMN "name" text DEFAULT 'Unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "editor" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_editor_id_editor_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."editor"("id") ON DELETE no action ON UPDATE no action;