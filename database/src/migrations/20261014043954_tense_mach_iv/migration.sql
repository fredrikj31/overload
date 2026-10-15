CREATE TABLE "routine" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" text NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
ALTER TABLE "routine" ADD CONSTRAINT "routine_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");