// Mirrors database/src/schemas/set_type.ts. The frontend doesn't depend on
// the database package, so the enum is declared here; keep it in sync.

/**
 * How a set is meant to be (or was) performed. Shared by routine (planned)
 * sets and workout (logged) sets.
 *
 * - normal:  a regular working set
 * - warmup:  a lighter preparatory set
 * - failure: taken to muscular failure / as many reps as possible
 * - dropset: weight reduced immediately after the previous set
 */
export const SET_TYPES = ["normal", "warmup", "failure", "dropset"] as const;
export type SetType = (typeof SET_TYPES)[number];
