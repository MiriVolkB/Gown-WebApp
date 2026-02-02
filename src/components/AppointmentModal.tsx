'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react'; // Removed unused icons
import { format } from 'date-fns';

const SERVICE_OPTIONS = [
  'First Appointment',
  'First Fitting',
  'Second Fitting',
  'Pickup',
  'Rental'
];

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSave: (data: any) => void;
  initialData?: any; 
}

export default function AppointmentModal({ isOpen, onClose, selectedDate, selectedTime, onSave, initialData }: AppointmentModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);
  const [serviceName, setServiceName] = useState(SERVICE_OPTIONS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');

  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => {
        if (Array.isArray(data)) setClients(data);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
  if (isOpen) {
    if (initialData) {
      setClientName(initialData.title || '');
      setClientId(initialData.resource?.clientId || null);
      
      const currentService = initialData.resource?.service?.name;
      setServiceName(SERVICE_OPTIONS.includes(currentService) ? currentService : SERVICE_OPTIONS[0]);
      
      // FIX: Add safety checks for the start date
      const start = initialData.start ? new Date(initialData.start) : null;
      
      if (start && !isNaN(start.getTime())) {
        setDate(format(start, 'yyyy-MM-dd'));
        setTime(format(start, 'HH:mm'));
      } else {
        // Fallback if initialData.start is invalid
        setDate('');
        setTime('');
      }

      setNotes(initialData.resource?.notes || '');
      
      // FIX: Add safety checks for the end date
      const end = initialData.end ? new Date(initialData.end) : null;
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = (end.getTime() - start.getTime()) / 60000;
        setDuration(diff.toString());
      } else {
        setDuration('30');
      }
    } else {
      // New Appointment Logic
      setClientName('');
      setClientId(null);
      setServiceName(SERVICE_OPTIONS[0]);
      
      // FIX: Ensure selectedDate is valid before formatting
      if (selectedDate && !isNaN(selectedDate.getTime())) {
        setDate(format(selectedDate, 'yyyy-MM-dd'));
      } else {
        setDate('');
      }
      
      if (selectedTime) setTime(selectedTime);
      setDuration('30');
      setNotes('');
    }
  }
}, [isOpen, selectedDate, selectedTime, initialData]);

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientName(term);
    setClientId(null);
    if (term.length > 0) {
      const matches = clients.filter(c => c.name.toLowerCase().includes(term.toLowerCase()));
      setFilteredClients(matches);
      setShowClientList(true);
    } else {
      setShowClientList(false);
    }
  };

  const selectClient = (client: any) => {
    setClientName(client.name);
    setClientId(client.id);
    setShowClientList(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !date || !time) {
        alert("Please fill in Client, Date, and Time");
        return;
    }

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

    onSave({
      id: initialData?.id,
      clientName,
      clientId,
      serviceName,
      start: startDateTime,
      end: endDateTime,
      notes
    });
  };

  return (
  /* 1. THE DARK OVERLAY */
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">

    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
      
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Client Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <input 
            type="text" 
            placeholder="Search client..." 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={clientName}
            onChange={handleClientSearch}
            onFocus={() => clientName && setShowClientList(true)}
            onBlur={() => setTimeout(() => setShowClientList(false), 200)}
          />
          {showClientList && filteredClients.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
              {filteredClients.map(client => (
                <div 
                  key={client.id} 
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0" 
                  onClick={() => selectClient(client)}
                >
                  {client.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Selection */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
           <div className="relative">
             <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white appearance-none focus:ring-2 focus:ring-blue-500"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
             >
                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input 
                    type="time" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>
        </div>

        {/* Duration */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
            >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="90">1.5 Hours</option>
                <option value="120">2 Hours</option>
            </select>
        </div>

        {/* Notes */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
            <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium shadow-sm transition-colors"
            >
                {initialData ? 'Update' : 'Save Appointment'}
            </button>
        </div>
      </form>
    </div>
  </div>
);}