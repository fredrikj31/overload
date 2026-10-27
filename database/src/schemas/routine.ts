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

/**
 * A routine which is a list of exercises that you do.
 */
export const routine = pgTable(
  "routine",
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
    name: varchar("name").notNull(),
    description: varchar("description"),
  },
  (table) => [index("routine_user_id_idx").on(table.userId)],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  userId: (schema: z.ZodString) => schema.min(1),
  // The messages are user-facing: the frontend mirrors them in its forms.
  name: (schema: z.ZodString) =>
    schema
      .trim()
      .min(1, "Name is required")
      .max(200, "Name must be 200 characters or fewer"),
  description: (schema: z.ZodString) =>
    schema.trim().max(2000, "Description must be 2000 characters or fewer"),
};

export const RoutineSchema = createSelectSchema(routine, refinements);
export type Routine = z.infer<typeof RoutineSchema>;
