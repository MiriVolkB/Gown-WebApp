import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().min(1, "Phone is required"),
  WeddingDate: z.string().datetime("Invalid date format").optional(),
  dueDate : z.string().datetime("Invalid date format").optional(),
  price: z.number().nullable().optional(),
  fabricType: z.string().optional(),
  Recommended: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial(); 
// makes all fields optional for PATCH
