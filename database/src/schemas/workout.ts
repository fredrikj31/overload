import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { routine } from "./routine";

/**
 * A single training session a user performs (or performed).
 *
 * A workout is either started from a routine, in which case `routine_id`
 * points at it and the exercises and sets are pre-filled from the routine's
 * prescriptions, or started empty (`routine_id` null) with the user adding
 * exercises as they go. Either way the workout is its own snapshot: later
 * edits to the routine never change what was logged.
 *
 * Lifecycle is carried by the timestamps: `started_at` is set when the
 * workout is created and `ended_at` stays null while it is in progress.
 * Discarding an unfinished workout is a soft delete (`deleted_at`).
 */
export const workout = pgTable(
  "workout",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    // The routine this workout was started from; null for an empty workout.
    // Routines are soft-deleted, but should one ever be removed for real the
    // workout history must survive it, hence set null rather than cascade.
    routineId: uuid("routine_id").references(() => routine.id, {
      onDelete: "set null",
    }),
    // Filled by the API: the routine's name, or a default for empty workouts.
    name: varchar("name").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    // Null while the workout is in progress.
    endedAt: timestamp("ended_at"),
  },
  (table) => [
    // Covers both "workouts of a user" and "recent workouts of a user".
    index("workout_user_id_started_at_idx").on(table.userId, table.startedAt),
    index("workout_routine_id_idx").on(table.routineId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  routineId: () => z.uuid(),
  userId: (schema: z.ZodString) => schema.min(1),
  // The messages are user-facing: the frontend mirrors them in its forms.
  name: (schema: z.ZodString) =>
    schema
      .trim()
      .min(1, "Name is required")
      .max(200, "Name must be 200 characters or fewer"),
};

export const WorkoutSchema = createSelectSchema(workout, refinements);
export type Workout = z.infer<typeof WorkoutSchema>;
