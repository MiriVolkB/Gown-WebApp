import { z } from "zod";

// Allows digits, spaces, and hyphens (e.g. 052-441-2290)
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]{1,3})?([\s\-0-9]{9,14})$/
);

export const CreateClientSchema = z.object({
  // --- Family Level Fields ---
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number").min(10, "Phone number is too short"),
  
  // Allows a valid email OR an empty string
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  
  // Use string or coerce to handle the YYYY-MM-DD from the browser
  WeddingDate: z.string().optional().nullable(),
  dueDate: z.string().min(1, "Need Gown By date is required"),
  
  Recommended: z.string().optional(),
  // ---> ADD THESE TWO LINES <---
  hasDownpayment: z.boolean().default(false).optional(),
  downpaymentAmount: z.number().default(0).optional(),
  notes: z.string().optional(),

  projects: z.array(z.object({
    memberName: z.string().min(1, "Member name is required"),
    orderType: z.enum(["RENTAL", "CUSTOM_MAKE", "CUSTOM_MAKE_RENTAL"]),
    price: z.number().min(0),
  })).min(1), // At least one gown is required
});

// Partial update of Client scalar fields only (no projects / payments)
export const UpdateClientSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .min(10, "Phone number is too short")
    .optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  WeddingDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  Recommended: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});