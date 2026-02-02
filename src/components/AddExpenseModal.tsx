'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  memberName: string;
}

interface AddExpenseModalProps {
  projects?: Project[]; // Pass this if calling from Overview
  initialProjectId?: number; // Pass this if calling from a specific Gown tab
  onClose: () => void;
}

export default function AddExpenseModal({ projects, initialProjectId, onClose }: AddExpenseModalProps) {
    const router = useRouter();
  const [form, setForm] = useState({ 
    projectId: initialProjectId || (projects && projects[0]?.id) || 0, 
    type: "Fabric", 
    amount: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.projectId) return alert("Please select a client/gown");
    
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: Number(form.projectId),
          type: form.type,
          amount: Number(form.amount)
        }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-100">
        <h3 className="text-2xl font-serif mb-6 text-slate-900">Add Gown Expense</h3>

        <div className="space-y-5">
          {/* CLIENT SELECTION: Only shows if projects list is provided (Overview mode) */}
          {projects && !initialProjectId && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Client / Gown</label>
              <select
                className="w-full border-slate-200 rounded-lg p-3 mt-1 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })}
              >
                <option value="">Select a member...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.memberName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expense Type</label>
            <select
              className="w-full border-slate-200 rounded-lg p-3 mt-1 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900/5"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="Fabric">Fabric</option>
              <option value="Dying">Dying</option>
              <option value="Beading">Beading</option>
              <option value="Tailoring">Extra Tailoring</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (NIS)</label>
            <input
              type="number"
              className="w-full border-slate-200 rounded-lg p-3 mt-1 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900/5"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button className="flex-1 py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors" onClick={onClose}>
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 active:scale-95 transition-all"
            onClick={handleSave}
            disabled={!form.amount || loading}
          >
            {loading ? "Saving..." : "Confirm Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}