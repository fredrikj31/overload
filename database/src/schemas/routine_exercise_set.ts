import {
  foreignKey,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { routineExercise } from "./routine_exercise";
import { weightUnitEnum } from "./weight_unit";

/**
 * How a planned set is meant to be performed.
 *
 * - normal:  a regular working set
 * - warmup:  a lighter preparatory set
 * - failure: taken to muscular failure / as many reps as possible
 * - dropset: weight reduced immediately after the previous set
 */
export const SET_TYPES = ["normal", "warmup", "failure", "dropset"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const setTypeEnum = pgEnum("set_type", SET_TYPES);

/**
 * A planned set belonging to an exercise slot in a routine.
 *
 * One row per set. This is the template the routine prescribes, not a logged
 * workout set. `position` is a 0-based sort key within the exercise slot;
 * gaps are allowed and clients order by it. `weight` is stored as entered, in
 * `weight_unit`, and is null for bodyweight / unloaded sets. Deleting the
 * exercise slot takes its sets with it.
 */
export const routineExerciseSet = pgTable(
  "routine_exercise_set",
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
    routineExerciseId: uuid("routine_exercise_id").notNull(),
    // Sort order within the exercise slot.
    position: integer("position").notNull(),
    type: setTypeEnum("type").notNull().default("normal"),
    // Target repetitions for the set.
    reps: integer("reps").notNull(),
    // Stored per set so the value is kept exactly as the user typed it (no
    // kg <-> lb rounding drift) and so a row is self-describing without a join.
    // Deliberately no database default: the API fills in the user's preferred
    // unit when a client omits it, so the row always states its own unit.
    weightUnit: weightUnitEnum("weight_unit").notNull(),
    // Load as entered, in `weight_unit`; null means bodyweight / no added load.
    weight: numeric("weight", { precision: 6, scale: 2, mode: "number" }),
  },
  (table) => [
    // Deleting an exercise slot takes its sets with it.
    foreignKey({
      name: "routine_exercise_set_routine_exercise_id_fkey",
      columns: [table.routineExerciseId],
      foreignColumns: [routineExercise.id],
    }).onDelete("cascade"),
    index("routine_exercise_set_routine_exercise_id_idx").on(
      table.routineExerciseId,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
// `type` and `weightUnit` need no refinement: drizzle-zod maps pgEnums to
// z.enum itself. `weightUnit` has no column default; the backend request
// schema defaults it from the user's preference before insert.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  routineExerciseId: () => z.uuid(),
  // drizzle-orm 1.0 reports integer columns as dataType "number int32", which
  // drizzle-zod 0.8 does not recognise, so it hands us z.any(). Build our own.
  position: () => z.int().min(0),
  // The messages are user-facing: the frontend mirrors them in its forms.
  reps: () =>
    z
      .number({ error: "Reps is required" })
      .int("Reps must be a whole number")
      .min(0, "Reps can't be negative"),
  // numeric(6,2): at most four digits before the decimal point.
  weight: () =>
    z
      .number({ error: "Weight must be a number" })
      .min(0, "Weight can't be negative")
      .max(9999.99, "Weight must be 9999.99 or less"),
};

export const RoutineExerciseSetSchema = createSelectSchema(
  routineExerciseSet,
  refinements,
);
export type RoutineExerciseSet = z.infer<typeof RoutineExerciseSetSchema>;
