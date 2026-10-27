import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Unit a weight was entered in. Shared by every table that stores a weight
 * (e.g. `routine_exercise_set.weight_unit`) and by `user_preference`, which
 * records the unit a user prefers to enter and see weights in.
 */
export const WEIGHT_UNITS = ["kg", "lb"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const weightUnitEnum = pgEnum("weight_unit", WEIGHT_UNITS);
