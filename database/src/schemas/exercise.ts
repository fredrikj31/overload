import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const exercise = pgTable(
  "exercise",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Id from the exercises dataset (e.g. "0025"). Null for exercises not imported from the dataset.
    datasetId: text("dataset_id").unique(),
    name: text("name").notNull(),
    bodyPart: text("body_part").notNull(),
    equipment: text("equipment").notNull(),
    target: text("target").notNull(),
    secondaryMuscles: text("secondary_muscles")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    instructions: text("instructions").array().notNull(),
    // Paths relative to the assets root (e.g. "exercises/images/0025-EIeI8Vf.jpg")
    imagePath: text("image_path"),
    gifPath: text("gif_path"),
    attribution: text("attribution"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("exercise_body_part_idx").on(table.bodyPart),
    index("exercise_equipment_idx").on(table.equipment),
  ],
);
