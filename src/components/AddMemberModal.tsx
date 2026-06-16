"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CheckCircle2 } from "lucide-react"; // 1. Imported the checkmark
import { BaseModal } from "@/components/BaseModal"; // 2. Imported the wrapper

export function AddMemberModal({
  clientId,
  onClose,
  onSave
}: {
  clientId: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // 3. Added success state
  const [form, setForm] = useState({
    memberName: "",
    orderType: "RENTAL",
    price: "2000",
  });

  const handleSubmit = async () => {
    if (!form.memberName || !form.price) return alert("Please fill in all fields");
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price) 
        }),
      });

      if (res.ok) {
        // 4. Trigger the success animation!
        setShowSuccess(true);
        setTimeout(() => {
          onSave();
          onClose();
          router.refresh(); // Added the smooth refresh here!
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 5. Use the BaseModal wrapper!
    <BaseModal
      title={showSuccess ? "Success" : "Add Family Member"}
      onClose={onClose}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Member Added!</h2>
          <p className="text-gray-500 text-sm">The gown has been added to the project.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                Member Name (e.g. Sarah / Mom)
              </label>
              <Input
                placeholder="Enter name"
                value={form.memberName}
                onChange={(e) => setForm({ ...form, memberName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                Order Type
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.orderType}
                onChange={(e) => {
                  const newType = e.target.value;
                  let newPrice = "2000"; 
                  if (newType === "CUSTOM_MAKE_RENTAL") {
                    newPrice = "2500";
                  } 
                  setForm({
                    ...form,
                    orderType: newType,
                    price: newPrice
                  });
                }}
              >
                <option value="RENTAL">Rental</option>
                <option value="CUSTOM_MAKE_RENTAL">Custom Made Rental</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                Price (₪)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-[#1E2024] text-white hover:opacity-90"
            >
              {loading ? "Adding..." : "Add to Folder"}
            </Button>
          </div>
        </>
      )}
    </BaseModal>
  );
}