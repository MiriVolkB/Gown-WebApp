"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, User } from "lucide-react"; // Icons for a better look

export function AddPaymentModal({ 
  clientId: initialClientId, 
allClients: initialClients = [], // Rename prop
  onClose, 
  onSave 
}: { 
  clientId?: number; 
  allClients: any[];
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [clients, setClients] = useState(initialClients);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{id: number, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

// Fetch clients only if we don't have them and we need to search
  useEffect(() => {
    if (!initialClientId && clients.length === 0) {
      const fetchClients = async () => {
        setLoadingClients(true);
        try {
          const res = await fetch("/api/clients");
          const data = await res.json();
          setClients(data);
        } catch (error) {
          console.error("Failed to load clients", error);
        } finally {
          setLoadingClients(false);
        }
      };
      fetchClients();
    }
  }, [initialClientId, clients.length]);

  //define whats the name.
  const clientName = initialClientId 
    ? clients.find(c => c.id === initialClientId)?.name 
    : selectedClient?.name;

  const [form, setForm] = useState({
    amount: "",
    method: "CASH",
    date: new Date().toISOString().split('T')[0],
  });

  const filteredResults = clients.filter((client) => {
  const query = searchQuery.toLowerCase();
  const name = client.name?.toLowerCase() || "";
  const phone = client.phone || "";
  return name.includes(query) || phone.includes(query);
}) || [];

const isSearching = !initialClientId || initialClientId === 0;
// Update the display logic:
// Show results only if the user is typing and hasn't selected someone yet
const showList = isSearching && searchQuery.length > 1 && !selectedClient && filteredResults.length > 0;
  const handleSubmit = async () => {
    const finalId = initialClientId || selectedClient?.id;
    if (!finalId) return alert("Please select a client");
    if (!form.amount) return alert("Enter amount");

    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${finalId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSave();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-serif mb-6 text-slate-900">Record Payment</h3>
        {clientName && (
  <p className="text-sm text-slate-500 italic">For: {clientName}</p>
)}

        <div className="space-y-4">
          {/* CLIENT SELECTOR SECTION */}
          {!initialClientId && !selectedClient ? (
            <div className="relative">
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Select Client</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
    setSearchQuery(e.target.value);
    
  }}
                />
              </div>
              {showList && (
                <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-40 overflow-auto">
                  {loadingClients ? (
      <div className="p-4 text-center text-sm text-gray-500">Loading clients...</div>
    ) : (
                  filteredResults.map(c => (
                    <div 
                      key={c.id} 
                      className="p-2 hover:bg-slate-50 cursor-pointer text-sm"
                      onClick={() => { setSelectedClient(c); setSearchQuery(""); }}
                    >
                      {c.name}
                    </div>
                  ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3 border border-slate-100">
              <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Client</p>
                <p className="font-medium text-slate-900">{selectedClient?.name || "Selected Client"}</p>
              </div>
              {!initialClientId && (
                 <button onClick={() => setSelectedClient(null)} className="ml-auto text-xs text-blue-600 hover:underline">Change</button>
              )}
            </div>
          )}

          {/* PAYMENT DETAILS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Amount (NIS)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={form.amount} 
                onChange={(e) => setForm({...form, amount: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Method</label>
              <select 
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                value={form.method}
                onChange={(e) => setForm({...form, method: e.target.value})}
              >
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Bank Transfer</option>
                <option value="BIT">Bit</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Date</label>
              <Input 
                type="date" 
                value={form.date} 
                onChange={(e) => setForm({...form, date: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={loading || (!initialClientId && !selectedClient)} 
            onClick={handleSubmit}
            className="bg-slate-900 text-white"
          >
            {loading ? "Recording..." : "Save Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}