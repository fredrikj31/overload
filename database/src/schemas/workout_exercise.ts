import { index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { exercise } from "./exercise";
import { routineExercise } from "./routine_exercise";
import { workout } from "./workout";

/**
 * An exercise performed as part of a workout.
 *
 * One row per exercise slot in the workout, mirroring `routine_exercise`. The
 * same exercise may appear more than once (e.g. supersets), so there is
 * deliberately no unique index on the (workout, exercise) pair. `position` is
 * a 0-based sort key within the workout; gaps are allowed and clients order
 * by it. The logged sets live in `workout_exercise_set`.
 *
 * `routine_exercise_id` remembers which routine slot this one was copied
 * from when the workout was started from a routine. It is null for exercises
 * added ad hoc during the workout and for empty workouts, and it is cleared
 * (not cascaded) if the routine slot is ever hard-deleted.
 */
export const workoutExercise = pgTable(
  "workout_exercise",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    // Deleting a workout takes its exercise slots with it.
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workout.id, { onDelete: "cascade" }),
    // A catalog exercise cannot be removed while a workout still logs it.
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "restrict" }),
    // The routine slot this was pre-filled from, if any.
    routineExerciseId: uuid("routine_exercise_id").references(
      () => routineExercise.id,
      { onDelete: "set null" },
    ),
    // Sort order within the workout.
    position: integer("position").notNull(),
  },
  (table) => [
    index("workout_exercise_workout_id_idx").on(table.workoutId),
    index("workout_exercise_exercise_id_idx").on(table.exerciseId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  workoutId: () => z.uuid(),
  exerciseId: () => z.uuid(),
  routineExerciseId: () => z.uuid(),
  // drizzle-orm 1.0 reports integer columns as dataType "number int32", which
  // drizzle-zod 0.8 does not recognise, so it hands us z.any(). Build our own.
  position: () => z.int().min(0),
};

export const WorkoutExerciseSchema = createSelectSchema(
  workoutExercise,
  refinements,
);
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
