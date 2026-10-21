"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Payment } from "@prisma/client";
import { BaseModal } from "@/components/BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Bank Transfer",
  BIT: "Bit",
};

export function EditPaymentModal({
  payment,
  onClose,
  onSaved,
}: {
  payment: Payment;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Older payments may have the method in small letters ("cash").
  const initialMethod = payment.method.toUpperCase();
  // The day as it is shown in the payments table.
  const initialDate = format(new Date(payment.date), "yyyy-MM-dd");

  const [amount, setAmount] = useState(String(payment.amount));
  const [method, setMethod] = useState(initialMethod);
  const [date, setDate] = useState(initialDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const newAmount = Number(amount);
    if (!amount || !(newAmount > 0)) {
      setError("Please enter an amount greater than 0.");
      return;
    }
    if (!date) {
      setError("Please choose a date.");
      return;
    }

    // Send only what changed, so untouched fields stay exactly as they were.
    const changes = {
      ...(newAmount !== payment.amount && { amount: newAmount }),
      ...(method !== initialMethod && { method }),
      ...(date !== initialDate && { date }),
    };
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        throw new Error(
          res.status === 400
            ? "Please check the amount and date."
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
    <BaseModal title="Edit Payment" onClose={() => !saving && onClose()}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Amount (₪)</label>
          <Input type="number" min={0} step={100} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Method</label>
          <select
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {!(initialMethod in METHOD_LABELS) && <option value={initialMethod}>{payment.method}</option>}
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
