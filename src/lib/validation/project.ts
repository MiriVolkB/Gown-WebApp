import { z } from "zod";

// Editing a gown: only the price can be changed.
export const updateProjectSchema = z
  .object({
    price: z.number().min(0, "Price cannot be negative"),
  })
  .strict();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
