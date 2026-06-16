"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { measurementSchema } from "@/lib/validation/measurement";
import { PrismaMeasurement } from "../types"; 
import { CheckCircle2 } from "lucide-react"; // 1. Added checkmark
import { BaseModal } from "@/components/BaseModal"; // 2. Added BaseModal wrapper

interface Props {
  projectId: number;
  onClose: () => void;
  measurementToEdit?: PrismaMeasurement | null;
}

export function AddMeasurementModal({ projectId, onClose, measurementToEdit }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});  
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state
  const [showSuccess, setShowSuccess] = useState(false); // Added success state
  const [form, setForm] = useState({
    Bust: "",
    waist: "",
    Hips: "",
    ShirtLength: "",
    SkirtLength: "",
    SleeveLength: "",
    SleeveWidth: "",
    ShoulderToBust: "",
    notes: "",
  });

  useEffect(() => {
    if (!measurementToEdit) return;

    setForm({
      Bust: String(measurementToEdit.Bust ?? ""),
      waist: String(measurementToEdit.waist ?? ""),
      Hips: String(measurementToEdit.Hips ?? ""),
      ShirtLength: String(measurementToEdit.ShirtLength ?? ""),
      SkirtLength: String(measurementToEdit.SkirtLength ?? ""),
      SleeveLength: String(measurementToEdit.SleeveLength ?? ""),
      SleeveWidth: String(measurementToEdit.SleeveWidth ?? ""),
      ShoulderToBust: String(measurementToEdit.ShoulderToBust ?? ""),
      notes: measurementToEdit.notes ?? "",
    });
  }, [measurementToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the error for this field when the user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async () => {
    // 1. Validate with Zod
    const parsed = measurementSchema.safeParse({
      projectId,
      Bust: Number(form.Bust),
      waist: Number(form.waist),
      Hips: Number(form.Hips),
      ShirtLength: Number(form.ShirtLength),
      SkirtLength: Number(form.SkirtLength),
      SleeveLength: Number(form.SleeveLength),
      SleeveWidth: Number(form.SleeveWidth),
      ShoulderToBust: Number(form.ShoulderToBust),
      notes: form.notes || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const url = measurementToEdit
      ? `/api/measurements/${measurementToEdit.id}`
      : `/api/measurements`;

    const method = measurementToEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        // Trigger success animation
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      } else {
        alert("Failed to save measurements.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Save error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    // 3. Replaced raw HTML with BaseModal
    <BaseModal
      title={showSuccess ? "Success" : (measurementToEdit ? "Edit Measurements" : "Add Measurements")}
      onClose={onClose}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Measurements Saved!</h2>
          <p className="text-gray-500 text-sm">The gown details have been updated.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="Bust">Bust (cm)</label>
              <Input
                id="Bust"
                name="Bust"
                placeholder="0"
                onChange={handleChange}
                value={form.Bust}
                className={errors.Bust ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.Bust && <p className="text-[10px] text-red-500 mt-1">{errors.Bust}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="waist">Waist (cm)</label>
              <Input
                id="waist"
                name="waist"
                placeholder="0"
                onChange={handleChange}
                value={form.waist}
                className={errors.waist ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.waist && <p className="text-[10px] text-red-500 mt-1">{errors.waist}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="Hips">Hips (cm)</label>
              <Input
                id="Hips"
                name="Hips"
                placeholder="0"
                onChange={handleChange}
                value={form.Hips}
                className={errors.Hips ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.Hips && <p className="text-[10px] text-red-500 mt-1">{errors.Hips}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="ShirtLength">Shirt Length (cm)</label>
              <Input
                id="ShirtLength"
                name="ShirtLength"
                placeholder="0"
                onChange={handleChange}
                value={form.ShirtLength}
                className={errors.ShirtLength ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.ShirtLength && <p className="text-[10px] text-red-500 mt-1">{errors.ShirtLength}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="SkirtLength">Skirt Length (cm)</label>
              <Input
                id="SkirtLength"
                name="SkirtLength"
                placeholder="0"
                onChange={handleChange}
                value={form.SkirtLength}
                className={errors.SkirtLength ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.SkirtLength && <p className="text-[10px] text-red-500 mt-1">{errors.SkirtLength}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="SleeveLength">Sleeve Length (cm)</label>
              <Input
                id="SleeveLength"
                name="SleeveLength"
                placeholder="0"
                onChange={handleChange}
                value={form.SleeveLength}
                className={errors.SleeveLength ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.SleeveLength && <p className="text-[10px] text-red-500 mt-1">{errors.SleeveLength}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="SleeveWidth">Sleeve Width (cm)</label>
              <Input
                id="SleeveWidth"
                name="SleeveWidth"
                placeholder="0"
                onChange={handleChange}
                value={form.SleeveWidth}
                className={errors.SleeveWidth ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.SleeveWidth && <p className="text-[10px] text-red-500 mt-1">{errors.SleeveWidth}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1" htmlFor="ShoulderToBust">Shoulder to Bust (cm)</label>
              <Input
                id="ShoulderToBust"
                name="ShoulderToBust"
                placeholder="0"
                onChange={handleChange}
                value={form.ShoulderToBust}
                className={errors.ShoulderToBust ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.ShoulderToBust && <p className="text-[10px] text-red-500 mt-1">{errors.ShoulderToBust}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Notes</label>
            <Textarea
              name="notes"
              placeholder="Any specific fit requests..."
              onChange={handleChange}
              value={form.notes} // Fixed: Added value so edits show up!
              rows={3}
            />
            {errors.notes && <p className="text-[10px] text-red-500 mt-1">{errors.notes}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-[#1E2024] text-white hover:opacity-90 shadow-sm"
            >
              {isSubmitting ? "Saving..." : (measurementToEdit ? "Save Changes" : "Save Measurements")}
            </Button>
          </div>
        </>
      )}
    </BaseModal>
  );
}