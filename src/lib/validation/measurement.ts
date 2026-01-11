import { z } from "zod";
/**
 * Measurement input validation schema
 * Used by BOTH frontend and API
 */
export const measurementSchema = z.object({
  clientId: z.number().int().positive("Client is required"),

  Bust: z.number().positive("Bust must be greater than 0"),
  waist: z.number().positive("Waist must be greater than 0"),
  Hips: z.number().positive("Hips must be greater than 0"),

  ShirtLength: z.number().positive("Shirt length must be greater than 0"),
  SkirtLength: z.number().positive("Skirt length must be greater than 0"),

  SleeveLength: z.number().positive("Sleeve length must be greater than 0"),
  SleeveWidth: z.number().positive("Sleeve width must be greater than 0"),

  ShoulderToBust: z.number().positive("Shoulder to bust must be greater than 0"),

  notes: z.string().optional(),
});


export type MeasurementInput = z.infer<typeof measurementSchema>;

export const updateMeasurementSchema = measurementSchema.extend({
  id: z.number().int().positive(),
});

export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
