// Mirrors database/src/schemas/weight_unit.ts. The frontend doesn't depend on
// the database package, so the enum is declared here; keep it in sync.

/**
 * Unit a weight was entered in. Shared by sets (`routineExerciseSet.weightUnit`)
 * and by the user's preferred unit (`userPreference.weightUnit`).
 */
export const WEIGHT_UNITS = ["kg", "lb"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];
