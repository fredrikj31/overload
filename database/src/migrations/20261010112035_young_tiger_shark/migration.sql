CREATE TABLE "exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"dataset_id" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"body_part_id" uuid,
	"equipment_id" uuid NOT NULL,
	"instructions" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_path" text NOT NULL,
	"gif_path" text NOT NULL,
	"attribution" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "exercise_body_part_id_idx" ON "exercise" ("body_part_id");--> statement-breakpoint
CREATE INDEX "exercise_equipment_id_idx" ON "exercise" ("equipment_id");--> statement-breakpoint
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_body_part_id_body_part_id_fkey" FOREIGN KEY ("body_part_id") REFERENCES "body_part"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_equipment_id_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT;