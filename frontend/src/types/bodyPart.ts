import { z } from "zod";

// Mirrors database/src/schemas/bodyPart.ts. The frontend doesn't depend on
// the database package, so the entity is declared here; keep it in sync.
// Request and response shapes are derived from it with pick / omit.

export const BodyPartSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  name: z.string().trim().min(1).max(100),
  slug: z.string().min(1).max(64),
});
export type BodyPart = z.infer<typeof BodyPartSchema>;
