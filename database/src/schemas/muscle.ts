import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { bodyPart } from "./bodyPart";

/**
 * Region ids understood by react-muscle-highlighter
 * (https://github.com/soroojshehryar/react-muscle-highlighter).
 *
 * Several muscles may share one region (e.g. lats and upper back both
 * highlight "upper-back"), so aggregate by `graphSlug` before rendering.
 */
export const GRAPH_SLUGS = [
  "abs",
  "adductors",
  "ankles",
  "biceps",
  "calves",
  "chest",
  "deltoids",
  "feet",
  "forearm",
  "gluteal",
  "hamstring",
  "hands",
  "hair",
  "head",
  "knees",
  "lower-back",
  "neck",
  "obliques",
  "quadriceps",
  "tibialis",
  "trapezius",
  "triceps",
  "upper-back",
] as const;
export type GraphSlug = (typeof GRAPH_SLUGS)[number];

/**
 * A canonical muscle (e.g. "lats", "quads", "hip_flexors").
 *
 * This is our own vocabulary, not the dataset's. Raw dataset strings such as
 * "latissimus dorsi" or "quadriceps" are resolved onto these rows at import
 * time. Each muscle belongs to one body part and maps to one body graph region.
 */
export const muscle = pgTable(
  "muscle",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    // Human readable label, e.g. "Hip flexors".
    name: text("name").notNull(),
    // Stable machine key, e.g. "hip_flexors". Used by the seeder to upsert.
    slug: text("slug").notNull().unique(),
    bodyPartId: uuid("body_part_id")
      .notNull()
      .references(() => bodyPart.id, { onDelete: "restrict" }),
    // Region to highlight on the body graph. Null if the graph has no region for it.
    graphSlug: text("graph_slug"),
  },
  (table) => [index("muscle_body_part_id_idx").on(table.bodyPartId)],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

/** Lowercase words separated by single underscores, e.g. "hip_flexors". */
const SLUG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: z.uuid(),
  bodyPartId: z.uuid(),
  name: (schema: z.ZodString) => schema.trim().min(1).max(100),
  slug: (schema: z.ZodString) =>
    schema
      .min(1)
      .max(64)
      .regex(
        SLUG_PATTERN,
        "Slug must be lowercase words separated by underscores (e.g. hip_flexors)",
      ),
  // Stored as text in the database, but only the body graph's region ids are valid.
  graphSlug: z.enum(GRAPH_SLUGS).nullable(),
};

export const MuscleSchema = createSelectSchema(muscle, refinements);
export type Muscle = z.infer<typeof MuscleSchema>;

export const CreateMuscleSchema = createInsertSchema(muscle, refinements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateMuscle = z.infer<typeof CreateMuscleSchema>;

export const UpdateMuscleSchema = createUpdateSchema(muscle, refinements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateMuscle = z.infer<typeof UpdateMuscleSchema>;
