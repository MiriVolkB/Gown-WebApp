"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { BaseModal } from "@/components/BaseModal";
import { Button } from "@/components/ui/button";

interface DeleteClientModalProps {
  clientId: number;
  clientName: string;
  onClose: () => void;
}

export function DeleteClientModal({
  clientId,
  clientName,
  onClose,
}: DeleteClientModalProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmed || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete client");
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/clients");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete client");
      setDeleting(false);
    }
  };

  return (
    <BaseModal
      title={showSuccess ? "Success" : "Delete Client Folder"}
      onClose={onClose}
      maxWidth="md"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Client “{clientName}” deleted
          </h2>
          <p className="text-gray-500 text-sm">
            The folder and all related data have been removed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-red-800 text-base">
                This cannot be undone
              </p>
              <p className="text-sm text-red-700 leading-relaxed">
                You are about to permanently delete{" "}
                <span className="font-semibold">“{clientName}”</span> and{" "}
                <span className="font-semibold">everything</span> linked to this
                folder:
              </p>
              <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                <li>All gowns / members</li>
                <li>All measurements</li>
                <li>All expenses</li>
                <li>All payments</li>
                <li>All appointments</li>
                <li>All notes and client details</li>
              </ul>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={deleting}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-slate-700 leading-snug">
              I understand this will permanently delete{" "}
              <span className="font-semibold">“{clientName}”</span> and all
              related data. This cannot be undone.
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="ghost" onClick={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!confirmed || deleting}
            >
              {deleting ? "Deleting..." : "Yes, permanently delete"}
            </Button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
