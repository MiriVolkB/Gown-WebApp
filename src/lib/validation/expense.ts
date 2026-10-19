import { z } from "zod";

const EXPENSE_TYPE_VALUES = ["Fabric", "Dying", "Beading", "Tailoring", "Other"] as const;

// The same choices as the "Add Gown Expense" window.
export const EXPENSE_TYPES: Record<(typeof EXPENSE_TYPE_VALUES)[number], string> = {
  Fabric: "Fabric",
  Dying: "Dying",
  Beading: "Beading",
  Tailoring: "Extra Tailoring",
  Other: "Other",
};

// Editing an expense: only the fields that changed are sent. The date cannot be edited.
export const updateExpenseSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0").optional(),
    type: z.enum(EXPENSE_TYPE_VALUES).optional(),
  })
  .strict();

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
