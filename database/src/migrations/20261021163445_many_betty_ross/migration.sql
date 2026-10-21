CREATE TABLE "routine_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"routine_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX "routine_exercise_routine_id_idx" ON "routine_exercise" ("routine_id");--> statement-breakpoint
CREATE INDEX "routine_exercise_exercise_id_idx" ON "routine_exercise" ("exercise_id");--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_routine_id_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_exercise_id_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;