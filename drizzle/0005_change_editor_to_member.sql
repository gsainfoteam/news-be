CREATE TYPE "public"."permission" AS ENUM('NONE', 'EDITOR', 'EDITORSHIP');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'REPORTING_SENIOR_REPORTER', 'SENIOR_DESIGNER', 'DIGITAL_SENIOR_REPORTER', 'REPORTING_REPORTER', 'DESIGNER', 'DIGITAL_REPORTER', 'CUB_REPORTER', 'ALUMNI');--> statement-breakpoint
CREATE TABLE "article_author" (
	"article_id" integer NOT NULL,
	"member_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "article_author_article_id_member_id_pk" PRIMARY KEY("article_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "editor" RENAME TO "member";--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "editor_email_unique";--> statement-breakpoint
ALTER TABLE "article" DROP CONSTRAINT "article_editor_id_editor_id_fk";
--> statement-breakpoint
DROP INDEX "editor_email_unique_idx";--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "role" "public"."role" DEFAULT 'CUB_REPORTER' NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "permission" "public"."permission" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
UPDATE "member" SET "role" = CASE WHEN "is_editorship" THEN 'EDITOR_IN_CHIEF' ELSE 'CUB_REPORTER' END::"public"."role", "permission" = CASE WHEN "is_editorship" THEN 'EDITORSHIP' ELSE 'NONE' END::"public"."permission";--> statement-breakpoint
ALTER TABLE "member" DROP COLUMN "is_editorship";--> statement-breakpoint
ALTER TABLE "article_author" ADD CONSTRAINT "article_author_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_author" ADD CONSTRAINT "article_author_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_author_member_idx" ON "article_author" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_email_unique_idx" ON "member" USING btree ("email") WHERE "member"."deleted_at" IS NULL;--> statement-breakpoint
INSERT INTO "article_author" ("article_id", "member_id", "sort_order") SELECT "id", "editor_id", 0 FROM "article";--> statement-breakpoint
ALTER TABLE "article" DROP COLUMN "editor_id";--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_email_unique" UNIQUE("email");