"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Expense } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function DeleteExpenseDialog({
  expense,
  onClose,
  onDeleted,
}: {
  expense: Expense;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Waits for the server before closing, so a failed delete is never hidden.
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted();
    } catch {
      setError("Could not delete. Nothing was removed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold">Delete Expense</h3>
          </div>
          <button
            onClick={() => !isDeleting && onClose()}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-3">
          <p className="text-slate-600 text-sm leading-relaxed">
            Delete the <span className="font-bold">{expense.type}</span> expense of{" "}
            <span className="font-bold">₪{expense.amount.toLocaleString()}</span>?
          </p>
          <p className="text-slate-600 text-sm font-semibold">Are you sure? This cannot be undone.</p>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        </div>

        <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="flex-1 bg-white">
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
