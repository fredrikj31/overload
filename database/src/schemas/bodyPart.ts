import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

/**
 * A region of the body (e.g. "back", "upper legs", "waist").
 *
 * Mirrors the `body_part` values in the exercise dataset. Muscles belong to a
 * body part; it is the coarsest level used for filtering exercises.
 */
export const bodyPart = pgTable("body_part", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
  // Human readable label, e.g. "Upper legs".
  name: text("name").notNull(),
  // Stable machine key, e.g. "upper_legs". Used by the seeder to upsert.
  slug: text("slug").notNull().unique(),
});

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

/** Lowercase words separated by single underscores, e.g. "upper_legs". */
const SLUG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const refinements = {
  name: (schema: z.ZodString) => schema.trim().min(1).max(100),
  slug: (schema: z.ZodString) =>
    schema
      .min(1)
      .max(64)
      .regex(
        SLUG_PATTERN,
        "Slug must be lowercase words separated by underscores (e.g. upper_legs)",
      ),
};

export const BodyPartSchema = createSelectSchema(bodyPart, refinements);
export type BodyPart = z.infer<typeof BodyPartSchema>;

export const CreateBodyPartSchema = createInsertSchema(
  bodyPart,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateBodyPart = z.infer<typeof CreateBodyPartSchema>;

export const UpdateBodyPartSchema = createUpdateSchema(
  bodyPart,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateBodyPart = z.infer<typeof UpdateBodyPartSchema>;
