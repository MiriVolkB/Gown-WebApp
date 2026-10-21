"use client";

import { useState } from "react";
import { BaseModal } from "@/components/BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditGownPriceModal({
  project,
  onClose,
  onSaved,
}: {
  project: { id: number; memberName: string; price: number };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [price, setPrice] = useState(String(project.price));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const newPrice = Number(price);
    if (!price.trim() || !Number.isFinite(newPrice) || newPrice < 0) {
      setError("Please enter a price of 0 or more.");
      return;
    }
    if (newPrice === project.price) {
      onClose();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      if (!res.ok) {
        throw new Error(
          res.status === 400
            ? "Please check the price."
            : "Could not save. Nothing was changed. Please try again."
        );
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal title="Edit Gown Price" onClose={() => !saving && onClose()}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500" dir="auto">{project.memberName}'s Gown</p>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Price (₪)</label>
          <Input type="number" min={0} step={100} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-rose-600 mt-4">{error}</p>}

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </BaseModal>
  );
}
