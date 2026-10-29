import {
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { setTypeEnum } from "./set_type";
import { weightUnitEnum } from "./weight_unit";
import { workoutExercise } from "./workout_exercise";

/**
 * A logged set belonging to an exercise slot in a workout.
 *
 * One row per set. This is what the user actually did (or is about to do),
 * as opposed to the prescription in `routine_exercise_set`. When a workout is
 * started from a routine, its sets are pre-filled with the routine's
 * `type`, `reps`, `weight` and `weight_unit`; the user then edits them in
 * place while training. `completed_at` is null until the set has been
 * performed, so a row with values but no `completed_at` is a pending set.
 * `reps` is nullable so a set can exist before the user has entered anything
 * (empty workouts, ad-hoc sets). `weight` is stored as entered, in
 * `weight_unit`, and is null for bodyweight / unloaded sets. `position` is a
 * 0-based sort key within the exercise slot; gaps are allowed and clients
 * order by it. Deleting the exercise slot takes its sets with it.
 */
export const workoutExerciseSet = pgTable(
  "workout_exercise_set",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    // FK declared below so it gets a readable name: the default
    // `<table>_<col>_<reftable>_<refcol>_fkey` exceeds Postgres' 63-char limit.
    workoutExerciseId: uuid("workout_exercise_id").notNull(),
    // Sort order within the exercise slot.
    position: integer("position").notNull(),
    type: setTypeEnum("type").notNull().default("normal"),
    // When the set was marked done; null while it is still pending.
    completedAt: timestamp("completed_at"),
    // Repetitions performed; null until the user enters a value.
    reps: integer("reps"),
    // Stored per set so the value is kept exactly as the user typed it (no
    // kg <-> lb rounding drift) and so a row is self-describing without a join.
    // Deliberately no database default: the API fills in the user's preferred
    // unit (or copies the routine set's) so the row always states its own unit.
    weightUnit: weightUnitEnum("weight_unit").notNull(),
    // Load as entered, in `weight_unit`; null means bodyweight / no added load.
    weight: numeric("weight", { precision: 6, scale: 2, mode: "number" }),
  },
  (table) => [
    // Deleting an exercise slot takes its sets with it.
    foreignKey({
      name: "workout_exercise_set_workout_exercise_id_fkey",
      columns: [table.workoutExerciseId],
      foreignColumns: [workoutExercise.id],
    }).onDelete("cascade"),
    index("workout_exercise_set_workout_exercise_id_idx").on(
      table.workoutExerciseId,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
// `type` and `weightUnit` need no refinement: drizzle-zod maps pgEnums to
// z.enum itself. `weightUnit` has no column default; the backend fills it
// before insert.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  workoutExerciseId: () => z.uuid(),
  // drizzle-orm 1.0 reports integer columns as dataType "number int32", which
  // drizzle-zod 0.8 does not recognise, so it hands us z.any(). Build our own.
  position: () => z.int().min(0),
  // The messages are user-facing: the frontend mirrors them in its forms.
  reps: () =>
    z
      .number({ error: "Reps must be a number" })
      .int("Reps must be a whole number")
      .min(0, "Reps can't be negative"),
  // numeric(6,2): at most four digits before the decimal point.
  weight: () =>
    z
      .number({ error: "Weight must be a number" })
      .min(0, "Weight can't be negative")
      .max(9999.99, "Weight must be 9999.99 or less"),
};

export const WorkoutExerciseSetSchema = createSelectSchema(
  workoutExerciseSet,
  refinements,
);
export type WorkoutExerciseSet = z.infer<typeof WorkoutExerciseSetSchema>;
