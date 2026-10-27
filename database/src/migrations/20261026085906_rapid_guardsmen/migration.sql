CREATE TYPE "set_type" AS ENUM('normal', 'warmup', 'failure', 'dropset');--> statement-breakpoint
CREATE TYPE "weight_unit" AS ENUM('kg', 'lb');--> statement-breakpoint
CREATE TABLE "routine_exercise_set" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"routine_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "set_type" DEFAULT 'normal'::"set_type" NOT NULL,
	"reps" integer NOT NULL,
	"weight_unit" "weight_unit" NOT NULL,
	"weight" numeric(6,2)
);
--> statement-breakpoint
CREATE INDEX "routine_exercise_set_routine_exercise_id_idx" ON "routine_exercise_set" ("routine_exercise_id");--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercise"("id") ON DELETE CASCADE;