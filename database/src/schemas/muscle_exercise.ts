import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { exercise } from "./exercise";
import { muscle } from "./muscle";

/**
 * How strongly an exercise works a muscle.
 *
 * - primary:   the dataset's `target` muscle
 * - secondary: one of the dataset's `secondary_muscles`
 */
export const MUSCLE_ROLES = ["primary", "secondary"] as const;
export type MuscleRole = (typeof MUSCLE_ROLES)[number];

export const muscleRoleEnum = pgEnum("muscle_role", MUSCLE_ROLES);

/**
 * Junction between exercises and the muscles they work.
 *
 * One row per (exercise, muscle) pair. If the dataset lists the same canonical
 * muscle both as target and as a secondary muscle, only one row is kept with
 * the primary role.
 */
export const muscleExercise = pgTable(
  "muscle_exercise",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "cascade" }),
    muscleId: uuid("muscle_id")
      .notNull()
      .references(() => muscle.id, { onDelete: "restrict" }),
    role: muscleRoleEnum("role").notNull(),
  },
  (table) => [
    uniqueIndex("muscle_exercise_exercise_id_muscle_id_idx").on(
      table.exerciseId,
      table.muscleId,
    ),
    index("muscle_exercise_muscle_id_idx").on(table.muscleId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable / defaulted columns in
// `.nullable()` / `.optional()` for the insert and update schemas.
// `role` needs no refinement: drizzle-zod maps the pgEnum to z.enum itself.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  exerciseId: () => z.uuid(),
  muscleId: () => z.uuid(),
};

export const MuscleExerciseSchema = createSelectSchema(
  muscleExercise,
  refinements,
);
export type MuscleExercise = z.infer<typeof MuscleExerciseSchema>;

export const CreateMuscleExerciseSchema = createInsertSchema(
  muscleExercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateMuscleExercise = z.infer<typeof CreateMuscleExerciseSchema>;

export const UpdateMuscleExerciseSchema = createUpdateSchema(
  muscleExercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateMuscleExercise = z.infer<typeof UpdateMuscleExerciseSchema>;
