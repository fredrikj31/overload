import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
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

// Callback form so drizzle-zod still wraps nullable / defaulted columns in
// `.nullable()` / `.optional()` for the insert and update schemas.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  userId: (schema: z.ZodString) => schema.min(1),
  name: (schema: z.ZodString) => schema.trim().min(1).max(200),
  description: (schema: z.ZodString) => schema.trim().max(2000),
};

export const RoutineSchema = createSelectSchema(routine, refinements);
export type Routine = z.infer<typeof RoutineSchema>;

export const CreateRoutineSchema = createInsertSchema(
  routine,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateRoutine = z.infer<typeof CreateRoutineSchema>;

export const UpdateRoutineSchema = createUpdateSchema(
  routine,
  refinements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateRoutine = z.infer<typeof UpdateRoutineSchema>;
