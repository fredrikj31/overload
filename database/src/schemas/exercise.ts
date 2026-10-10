import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { bodyPart } from "./bodyPart";
import { equipment } from "./equipment";

/**
 * An exercise imported from the exercises dataset by the seeder.
 *
 * Which muscles an exercise works is not stored here; that lives in the
 * exercise <-> muscle junction table.
 */
export const exercise = pgTable(
  "exercise",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    // Id from the exercises dataset (e.g. "0025"). Used by the seeder to upsert.
    datasetId: text("dataset_id").notNull().unique(),
    // Human readable label, e.g. "barbell bench press".
    name: text("name").notNull(),
    // Nullable: cardio exercises have no body region.
    bodyPartId: uuid("body_part_id").references(() => bodyPart.id, {
      onDelete: "restrict",
    }),
    equipmentId: uuid("equipment_id")
      .notNull()
      .references(() => equipment.id, { onDelete: "restrict" }),
    // English step-by-step instructions.
    instructions: text("instructions")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Paths relative to the media root, served by nginx under /media/
    // (e.g. "exercises/images/0025-EIeI8Vf.jpg").
    imagePath: text("image_path").notNull(),
    gifPath: text("gif_path").notNull(),
    attribution: text("attribution").notNull(),
  },
  (table) => [
    index("exercise_body_part_id_idx").on(table.bodyPartId),
    index("exercise_equipment_id_idx").on(table.equipmentId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

/** Dataset ids are four digits, e.g. "0025". */
const DATASET_ID_PATTERN = /^[0-9]{4}$/;

// Callback form so drizzle-zod still wraps nullable / defaulted columns in
// `.nullable()` / `.optional()` for the insert and update schemas.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  bodyPartId: () => z.uuid(),
  datasetId: (schema: z.ZodString) => schema.regex(DATASET_ID_PATTERN),
  name: (schema: z.ZodString) => schema.trim().min(1).max(200),
  equipmentId: () => z.uuid(),
  instructions: () => z.array(z.string().trim().min(1).max(2000)).max(50),
  imagePath: (schema: z.ZodString) => schema.min(1).max(500),
  gifPath: (schema: z.ZodString) => schema.min(1).max(500),
  attribution: (schema: z.ZodString) => schema.max(500),
};

export const ExerciseSchema = createSelectSchema(exercise, refinements);
export type Exercise = z.infer<typeof ExerciseSchema>;

export const CreateExerciseSchema = createInsertSchema(
  exercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateExercise = z.infer<typeof CreateExerciseSchema>;

export const UpdateExerciseSchema = createUpdateSchema(
  exercise,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateExercise = z.infer<typeof UpdateExerciseSchema>;
