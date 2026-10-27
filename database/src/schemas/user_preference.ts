import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { weightUnitEnum } from "./routine_exercise_set";

/**
 * Per-user settings. One row per user, keyed by the user id.
 *
 * The row is created lazily the first time the user saves a setting, so
 * every preference column has a database default and readers must treat a
 * missing row as "all defaults". Deleting the user removes the row.
 */
export const userPreference = pgTable("user_preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  // Unit the user prefers to enter and see weights in. The API uses it to
  // fill `routine_exercise_set.weight_unit` when a client omits it.
  weightUnit: weightUnitEnum("weight_unit").notNull().default("kg"),
});

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
// `weightUnit` needs no refinement: drizzle-zod maps pgEnums to z.enum itself.
const refinements = {
  userId: (schema: z.ZodString) => schema.min(1),
};

export const UserPreferenceSchema = createSelectSchema(
  userPreference,
  refinements,
);
export type UserPreference = z.infer<typeof UserPreferenceSchema>;
