CREATE TABLE "workout_exercise_set" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"workout_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"type" "set_type" DEFAULT 'normal'::"set_type" NOT NULL,
	"completed_at" timestamp,
	"reps" integer,
	"weight_unit" "weight_unit" NOT NULL,
	"weight" numeric(6,2)
);
--> statement-breakpoint
CREATE TABLE "workout_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"routine_exercise_id" uuid,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" text NOT NULL,
	"routine_id" uuid,
	"name" varchar NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "workout_exercise_set_workout_exercise_id_idx" ON "workout_exercise_set" ("workout_exercise_id");--> statement-breakpoint
CREATE INDEX "workout_exercise_workout_id_idx" ON "workout_exercise" ("workout_id");--> statement-breakpoint
CREATE INDEX "workout_exercise_exercise_id_idx" ON "workout_exercise" ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_user_id_started_at_idx" ON "workout" ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "workout_routine_id_idx" ON "workout" ("routine_id");--> statement-breakpoint
ALTER TABLE "workout_exercise_set" ADD CONSTRAINT "workout_exercise_set_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_workout_id_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_exercise_id_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_routine_exercise_id_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercise"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_routine_id_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE SET NULL;