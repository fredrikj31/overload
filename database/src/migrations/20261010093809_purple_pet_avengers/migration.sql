CREATE TABLE "muscle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"body_part_id" uuid NOT NULL,
	"graph_slug" text
);
--> statement-breakpoint
CREATE INDEX "muscle_body_part_id_idx" ON "muscle" ("body_part_id");--> statement-breakpoint
ALTER TABLE "muscle" ADD CONSTRAINT "muscle_body_part_id_body_part_id_fkey" FOREIGN KEY ("body_part_id") REFERENCES "body_part"("id") ON DELETE RESTRICT;