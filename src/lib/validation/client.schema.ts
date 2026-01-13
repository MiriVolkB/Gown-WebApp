import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  WeddingDate: z.string().datetime("Invalid date format"),
  NeedGownBy: z.string().datetime("Invalid date format"),
  Recommended: z.string(),
  notes: z.string(),
});
