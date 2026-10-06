CREATE TABLE "exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"dataset_id" text UNIQUE,
	"name" text NOT NULL,
	"body_part" text NOT NULL,
	"equipment" text NOT NULL,
	"target" text NOT NULL,
	"secondary_muscles" text[] DEFAULT '{}'::text[] NOT NULL,
	"instructions" text[] NOT NULL,
	"image_path" text,
	"gif_path" text,
	"attribution" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "exercise_body_part_idx" ON "exercise" ("body_part");--> statement-breakpoint
CREATE INDEX "exercise_equipment_idx" ON "exercise" ("equipment");