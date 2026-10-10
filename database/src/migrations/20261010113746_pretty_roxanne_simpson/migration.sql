CREATE TYPE "muscle_role" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TABLE "muscle_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"exercise_id" uuid NOT NULL,
	"muscle_id" uuid NOT NULL,
	"role" "muscle_role" NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "muscle_exercise_exercise_id_muscle_id_idx" ON "muscle_exercise" ("exercise_id","muscle_id");--> statement-breakpoint
CREATE INDEX "muscle_exercise_muscle_id_idx" ON "muscle_exercise" ("muscle_id");--> statement-breakpoint
ALTER TABLE "muscle_exercise" ADD CONSTRAINT "muscle_exercise_exercise_id_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "muscle_exercise" ADD CONSTRAINT "muscle_exercise_muscle_id_muscle_id_fkey" FOREIGN KEY ("muscle_id") REFERENCES "muscle"("id") ON DELETE RESTRICT;