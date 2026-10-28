import { z } from "zod";
import { WEIGHT_UNITS } from "./weightUnit";

// Mirrors database/src/schemas/user_preference.ts. The frontend doesn't
// depend on the database package, so the entity is declared here; keep it in
// sync. Request and response shapes are derived from it with pick / partial.

export const UserPreferenceSchema = z.object({
  userId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  // Unit the user prefers to enter and see weights in.
  weightUnit: z.enum(WEIGHT_UNITS),
});
export type UserPreference = z.infer<typeof UserPreferenceSchema>;
