"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddMemberModal({
  clientId,
  onClose,
  onSave
}: {
  clientId: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    memberName: "",
    orderType: "RENTAL",
    price: "1800",
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
          // Convert price to number if your API/Prisma expects a Float/Int
          price: Number(form.price) 
        }),
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-serif mb-6" style={{ color: '#1E2024' }}>
          Add Family Member
        </h3>

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
            {/* Standard HTML Select styled to match your Inputs */}
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.orderType}
              onChange={(e) => {
                const newType = e.target.value;

                // Handle all 3 price tiers
                let newPrice = "1800"; 
                if (newType === "CUSTOM_MAKE") {
                  newPrice = "3000";
                } else if (newType === "CUSTOM_MAKE_RENTAL") {
                  newPrice = "2500";
                }

                // 2. Update BOTH in one go
                setForm({
                  ...form,
                  orderType: newType,
                  price: newPrice
                });
              }}
            >
              <option value="RENTAL">Rental</option>
              <option value="CUSTOM_MAKE">Custom Made To keep</option>
              <option value="CUSTOM_MAKE_RENTAL">Custom Made Rental</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
              Price (NIS)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            style={{ backgroundColor: '#1E2024', color: 'white' }}
          >
            {loading ? "Adding..." : "Add to Folder"}
          </Button>
        </div>
      </div>
    </div>
  );
}