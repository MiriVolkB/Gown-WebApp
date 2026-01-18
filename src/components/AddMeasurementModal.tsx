"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { measurementSchema } from "@/lib/validation/measurement";
import { Measurement } from "../types"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import router from "next/dist/shared/lib/router/router";



interface Props {
  clientId: number;
  onClose: () => void;
  measurementToEdit?: Measurement | null;
}

export function AddMeasurementModal({ clientId, onClose, measurementToEdit }: Props) {
const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});  
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
  };

  const handleSubmit = async () => {
  const parsed = measurementSchema.safeParse({
    clientId,
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

  const url = measurementToEdit
    ? `/api/measurements/${measurementToEdit.id}`
    : `/api/measurements`;

  const method = measurementToEdit ? "PATCH" : "POST";

  await fetch("/api/measurements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  onClose();

  router.refresh();
};


 return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h3 className="text-lg font-medium mb-4">
        {measurementToEdit ? "Edit Measurements" : "Add Measurements"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="Bust">Bust (cm)</label>
    <Input
      id="Bust"
      name="Bust"
      placeholder="Enter Bust"
      onChange={handleChange}
      value={form.Bust}
    />
    {errors.Bust && <p className="text-sm text-red-500">{errors.Bust}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="waist">Waist (cm)</label>
    <Input
      id="waist"
      name="waist"
      placeholder="Enter Waist"
      onChange={handleChange}
      value={form.waist}
    />
    {errors.waist && <p className="text-sm text-red-500">{errors.waist}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="Hips">Hips (cm)</label>
    <Input
      id="Hips"
      name="Hips"
      placeholder="Enter Hips"
      onChange={handleChange}
      value={form.Hips}
    />
    {errors.Hips && <p className="text-sm text-red-500">{errors.Hips}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="ShirtLength">Shirt Length (cm)</label>
    <Input
      id="ShirtLength"
      name="ShirtLength"
      placeholder="Enter Shirt Length"
      onChange={handleChange}
      value={form.ShirtLength}
    />
    {errors.ShirtLength && <p className="text-sm text-red-500">{errors.ShirtLength}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="SkirtLength">Skirt Length (cm)</label>
    <Input
      id="SkirtLength"
      name="SkirtLength"
      placeholder="Enter Skirt Length"
      onChange={handleChange}
      value={form.SkirtLength}
    />
    {errors.SkirtLength && <p className="text-sm text-red-500">{errors.SkirtLength}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="SleeveLength">Sleeve Length (cm)</label>
    <Input
      id="SleeveLength"
      name="SleeveLength"
      placeholder="Enter Sleeve Length"
      onChange={handleChange}
      value={form.SleeveLength}
    />
    {errors.SleeveLength && <p className="text-sm text-red-500">{errors.SleeveLength}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="SleeveWidth">Sleeve Width (cm)</label>
    <Input
      id="SleeveWidth"
      name="SleeveWidth"
      placeholder="Enter Sleeve Width"
      onChange={handleChange}
      value={form.SleeveWidth}
    />
    {errors.SleeveWidth && <p className="text-sm text-red-500">{errors.SleeveWidth}</p>}
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1" htmlFor="ShoulderToBust">Shoulder to Bust (cm)</label>
    <Input
      id="ShoulderToBust"
      name="ShoulderToBust"
      placeholder="Enter Shoulder to Bust"
      onChange={handleChange}
      value={form.ShoulderToBust}
    />
    {errors.ShoulderToBust && <p className="text-sm text-red-500">{errors.ShoulderToBust}</p>}
  </div>
</div>


      <div className="mt-4">
        <Textarea
          name="notes"
          placeholder="Notes"
          onChange={handleChange}
        />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {measurementToEdit ? "Save Changes" : "Save"}
        </Button>
      </div>
    </div>
  </div>
);
}