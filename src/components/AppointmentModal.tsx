'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Calendar as CalIcon, User, Scissors, ChevronDown } from 'lucide-react';
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
        
        // Ensure service name matches one of our options or default to first
        const currentService = initialData.resource?.service?.name;
        if (SERVICE_OPTIONS.includes(currentService)) {
            setServiceName(currentService);
        } else {
            setServiceName(SERVICE_OPTIONS[0]);
        }
        
        const start = new Date(initialData.start);
        setDate(format(start, 'yyyy-MM-dd'));
        setTime(format(start, 'HH:mm'));
        setNotes(initialData.resource?.notes || '');
        
        const end = new Date(initialData.end);
        const diff = (end.getTime() - start.getTime()) / 60000;
        setDuration(diff.toString());
      } else {
        setClientName('');
        setClientId(null);
        setServiceName(SERVICE_OPTIONS[0]);
        if (selectedDate) setDate(format(selectedDate, 'yyyy-MM-dd'));
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Appointment' : 'New Appointment'}</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search client..." 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={clientName}
              onChange={handleClientSearch}
              onFocus={() => clientName && setShowClientList(true)}
              onBlur={() => setTimeout(() => setShowClientList(false), 200)}
            />
          </div>
          {showClientList && filteredClients.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
              {filteredClients.map(client => (
                <div key={client.id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => selectClient(client)}>
                  {client.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
           <div className="relative">
             <Scissors className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
             <select 
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg outline-none bg-white appearance-none"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
             >
                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                    <CalIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="date" 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="time" 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
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

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"
                placeholder="Add details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>

        <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium shadow-sm">
                {initialData ? 'Update' : 'Save'}
            </button>
        </div>
      </form>
    </div>
  );
}