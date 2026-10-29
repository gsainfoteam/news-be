CREATE TABLE "category_subscription" (
	"user_id" uuid NOT NULL,
	"category" "category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_subscription_user_id_category_pk" PRIMARY KEY("user_id","category")
);
--> statement-breakpoint
ALTER TABLE "category_subscription" ADD CONSTRAINT "category_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_subscription_category_idx" ON "category_subscription" USING btree ("category");