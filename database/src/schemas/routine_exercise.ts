import { index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { exercise } from "./exercise";
import { routine } from "./routine";

/**
 * Junction between a routine and the exercises it contains.
 *
 * One row per exercise slot in a routine. The same exercise may appear more
 * than once (e.g. supersets), so there is deliberately no unique index on the
 * (routine, exercise) pair. `position` is a 0-based sort key within the
 * routine; gaps are allowed and clients order by it. Sets / reps are not
 * stored here; they live in `routine_exercise_set`, which references this one.
 */
export const routineExercise = pgTable(
  "routine_exercise",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    // Deleting a routine takes its exercise slots with it.
    routineId: uuid("routine_id")
      .notNull()
      .references(() => routine.id, { onDelete: "cascade" }),
    // A catalog exercise cannot be removed while a routine still uses it.
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "restrict" }),
    // Sort order within the routine.
    position: integer("position").notNull(),
  },
  (table) => [
    index("routine_exercise_routine_id_idx").on(table.routineId),
    index("routine_exercise_exercise_id_idx").on(table.exerciseId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable / defaulted columns in
// `.nullable()` / `.optional()` for the insert and update schemas.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  routineId: () => z.uuid(),
  exerciseId: () => z.uuid(),
  // drizzle-orm 1.0 reports integer columns as dataType "number int32", which
  // drizzle-zod 0.8 does not recognise, so it hands us z.any(). Build our own.
  position: () => z.int().min(0),
};

export const RoutineExerciseSchema = createSelectSchema(
  routineExercise,
  refinements,
);
export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;

export const CreateRoutineExerciseSchema = createInsertSchema(
  routineExercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateRoutineExercise = z.infer<typeof CreateRoutineExerciseSchema>;

export const UpdateRoutineExerciseSchema = createUpdateSchema(
  routineExercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateRoutineExercise = z.infer<typeof UpdateRoutineExerciseSchema>;
