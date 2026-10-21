"use client";

import { useState } from "react";
import { Expense } from "@prisma/client";
import { BaseModal } from "@/components/BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPENSE_TYPES } from "@/lib/validation/expense";

export function EditExpenseModal({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [type, setType] = useState(expense.type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const newAmount = Number(amount);
    if (!amount || !(newAmount > 0)) {
      setError("Please enter an amount greater than 0.");
      return;
    }

    // Send only what changed, so an older type that is not in the list is kept as it is.
    const changes = {
      ...(newAmount !== expense.amount && { amount: newAmount }),
      ...(type !== expense.type && { type }),
    };
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        throw new Error(
          res.status === 400
            ? "Please check the type and amount."
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
    <BaseModal title="Edit Expense" onClose={() => !saving && onClose()}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Expense Type</label>
          <select
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {!(expense.type in EXPENSE_TYPES) && <option value={expense.type}>{expense.type}</option>}
            {Object.entries(EXPENSE_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Amount (₪)</label>
          <Input type="number" min={0} step={100} value={amount} onChange={(e) => setAmount(e.target.value)} />
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
