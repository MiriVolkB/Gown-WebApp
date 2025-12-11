// src/components/AppointmentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null; // Receive the clicked date
}

export default function AppointmentModal({ isOpen, onClose, selectedDate }: Props) {
  const [clients, setClients] = useState<any[]>([]); // Store the list of clients
  
  // Form States
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
// 1. Fetch Clients (SAFE VERSION)
  useEffect(() => {
    if (isOpen) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => {
            // SAFETY CHECK: Is this actually a list?
            if (Array.isArray(data)) {
                setClients(data);
            } else {
                console.error("Client API Error:", data);
                setClients([]); // Default to empty list if API fails
            }
        })
        .catch(err => {
            console.error("Failed to load clients", err);
            setClients([]);
        });
    }
  }, [isOpen]);

  // 2. Auto-fill Date & Time when you click the calendar
  useEffect(() => {
    if (selectedDate) {
      // Format Date: YYYY-MM-DD
      const dateStr = selectedDate.toISOString().split('T')[0];
      setDate(dateStr);

      // Format Time: HH:MM
      // We perform a small trick to get local time string correctly
      const timeStr = selectedDate.toTimeString().slice(0, 5);
      setTime(timeStr);
    }
  }, [selectedDate]);

  // 3. Handle Saving the Appointment
  async function handleSave() {
    if (!clientId || !date || !time) {
        alert("Please fill in all fields");
        return;
    }

    setLoading(true);
    
    // Create real Date objects for the backend
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60000); // Default 1 hour duration

    await fetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
            clientId: parseInt(clientId),
            serviceId: 1, // Default service for now
            start: startDateTime,
            end: endDateTime,
            notes: notes
        })
    });

    setLoading(false);
    onClose();
    window.location.reload(); // Refresh to show the new card
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
             <h2 className="text-xl font-serif font-bold text-slate-900">New Appointment</h2>
             <p className="text-sm text-slate-500">Book a fitting or consultation</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500 transition" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
            <select 
                className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-[#0B1120] outline-none"
                onChange={(e) => setClientId(e.target.value)}
                value={clientId}
            >
                <option value="">Select a Client...</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0B1120] outline-none" 
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0B1120] outline-none" 
              />
            </div>
          </div>

          {/* Notes */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
             <textarea 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0B1120] outline-none" 
                rows={3}
                placeholder="Details about the fitting..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
             />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#0B1120] text-white rounded-lg hover:bg-slate-800 disabled:opacity-70 transition shadow-lg"
            >
                {loading ? 'Saving...' : 'Save Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}