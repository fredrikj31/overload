import { pgEnum } from "drizzle-orm/pg-core";

/**
 * How a set is meant to be (or was) performed. Shared by the planned sets of a
 * routine (`routine_exercise_set.type`) and the logged sets of a workout
 * (`workout_exercise_set.type`).
 *
 * - normal:  a regular working set
 * - warmup:  a lighter preparatory set
 * - failure: taken to muscular failure / as many reps as possible
 * - dropset: weight reduced immediately after the previous set
 */
export const SET_TYPES = ["normal", "warmup", "failure", "dropset"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const setTypeEnum = pgEnum("set_type", SET_TYPES);
