import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

/**
 * Equipment an exercise is performed with (e.g. "barbell", "body weight",
 * "cable").
 *
 * Mirrors the `equipment` values in the exercise dataset. It describes how an
 * exercise is done, not which muscles it works, so it is independent of the
 * body part / muscle tables.
 */
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
  // Human readable label, e.g. "Body weight".
  name: text("name").notNull(),
  // Stable machine key, e.g. "body_weight". Used by the seeder to upsert.
  slug: text("slug").notNull().unique(),
});

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

/** Lowercase words separated by single underscores, e.g. "body_weight". */
const SLUG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  name: (schema: z.ZodString) => schema.trim().min(1).max(100),
  slug: (schema: z.ZodString) =>
    schema
      .min(1)
      .max(64)
      .regex(
        SLUG_PATTERN,
        "Slug must be lowercase words separated by underscores (e.g. body_weight)",
      ),
};

export const EquipmentSchema = createSelectSchema(equipment, refinements);
export type Equipment = z.infer<typeof EquipmentSchema>;

export const CreateEquipmentSchema = createInsertSchema(
  equipment,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>;

export const UpdateEquipmentSchema = createUpdateSchema(
  equipment,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateEquipment = z.infer<typeof UpdateEquipmentSchema>;
