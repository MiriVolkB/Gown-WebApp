import { z } from "zod";

export const PAYMENT_METHODS = ["CASH", "TRANSFER", "BIT"] as const;

// Editing a payment: only the fields that changed are sent.
// The date is a plain day ("2026-10-19"), saved the same way as when a payment is added.
export const updatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date is not valid")
    .refine((d) => !Number.isNaN(new Date(d).getTime()), "Date is not valid")
    .optional(),
});

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
