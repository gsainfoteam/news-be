ALTER TABLE "comment" RENAME COLUMN "comment" TO "content";--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_id_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("id") ON DELETE no action ON UPDATE no action;