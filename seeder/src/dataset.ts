import { z } from "zod";

// Subset of data/exercises.json from https://github.com/hasaneyldrm/exercises-dataset that we import.
// Full schema: data/exercises.schema.json in that repository.
export const datasetExerciseSchema = z.object({
  id: z.string().regex(/^[0-9]{4}$/),
  name: z.string().min(1),
  body_part: z.string().min(1),
  equipment: z.string().min(1),
  target: z.string().min(1),
  secondary_muscles: z.array(z.string()),
  instruction_steps: z.object({
    en: z.array(z.string()),
  }),
  image: z.string().startsWith("images/"),
  gif_url: z.string().startsWith("videos/"),
  attribution: z.string(),
});

export const datasetSchema = z.array(datasetExerciseSchema);

export type DatasetExercise = z.infer<typeof datasetExerciseSchema>;
