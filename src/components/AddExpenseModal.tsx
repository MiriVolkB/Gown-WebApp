'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react'; // 1. Imported the checkmark icon
import { BaseModal } from "@/components/BaseModal"; // 2. Imported the wrapper

interface Project {
  id: number;
  memberName: string;
  clientName?: string;
}

interface AddExpenseModalProps {
  projects?: Project[];
  initialProjectId?: number;
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
  const [showSuccess, setShowSuccess] = useState(false); // 3. Added success state
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);

  const selectedProject = useMemo(
    () => (projects || []).find((p) => p.id === form.projectId),
    [projects, form.projectId]
  );

  const filteredProjects = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return projects || [];
    return (projects || []).filter((p) =>
      (p.memberName || '').toLowerCase().includes(q) ||
      (p.clientName || '').toLowerCase().includes(q)
    );
  }, [projects, memberSearch]);

  // Shows the name once when the gown is for the client themself,
  // and "Family - Name" when it's a family member with a different name.
  const projectLabel = (p: Project) => {
    const gown = (p.memberName || '').trim();
    const family = (p.clientName || '').trim();
    if (!gown) return family;
    if (!family || gown.toLowerCase() === family.toLowerCase()) return gown;
    return `${family} - ${gown}`;
  };

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
        // 4. Trigger the success animation instead of instantly closing
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          setShowSuccess(false);
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save the expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 5. Replaced the messy HTML with the BaseModal wrapper
    <BaseModal
      title={showSuccess ? "Success" : "Add Gown Expense"}
      onClose={onClose}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Recorded!</h2>
          <p className="text-gray-500 text-sm">The project costs have been updated.</p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {/* CLIENT SELECTION: Always show when projects can be provided */}
            {!initialProjectId && (
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Client / Gown</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-3 mt-1 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm"
                  placeholder={!projects || projects.length === 0 ? "Loading..." : "Search by name..."}
                  disabled={!projects || projects.length === 0}
                  value={selectedProject && !showMemberList ? projectLabel(selectedProject) : memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setForm({ ...form, projectId: 0 });
                    setShowMemberList(true);
                  }}
                  onFocus={() => setShowMemberList(true)}
                  onBlur={() => setTimeout(() => setShowMemberList(false), 150)}
                />
                {showMemberList && filteredProjects.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                    {filteredProjects.map((p) => (
                      <div
                        key={p.id}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0"
                        onMouseDown={() => {
                          setForm({ ...form, projectId: p.id });
                          setMemberSearch('');
                          setShowMemberList(false);
                        }}
                      >
                        {projectLabel(p)}
                      </div>
                    ))}
                  </div>
                )}
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (₪)</label>
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
            <button 
              className="flex-1 py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors" 
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3 bg-[#1E2024] text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 active:scale-95 transition-all"
              onClick={handleSave}
              disabled={!form.amount || loading}
              type="button"
            >
              {loading ? "Saving..." : "Confirm Expense"}
            </button>
          </div>
        </>
      )}
    </BaseModal>
  );
}