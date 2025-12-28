'use client';

import React, { useState, useEffect } from 'react';
import CalendarView from '../../components/MyCalendar';
import AppointmentModal from '../../components/AppointmentModal';
import AppointmentDetails from '../../components/AppointmentDetails';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Stores the appointment currently being viewed or edited
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  // Stores the data specifically for editing (to pass to modal)
  const [editingData, setEditingData] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const formattedEvents = data.map((appt: any) => ({
            id: appt.id,
            title: appt.client?.name || 'Unknown', 
            start: new Date(appt.start),
            end: new Date(appt.end), 
            resource: { ...appt } 
        }));
        setAppointments(formattedEvents);
      })
      .catch(err => console.error(err));
  }, []);

  // 1. Create New (Click Empty Slot)
  const handleSlotClick = (slotInfo: { start: Date }) => {
    const date = slotInfo.start;
    setSelectedDate(date);
    setSelectedTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    setEditingData(null); // Clear edit data
    setSelectedEvent(null); // Close sidebar
    setIsModalOpen(true);            
  };

  // 2. View Details (Click Event)
  const handleEventClick = (event: any) => {
      setSelectedEvent(event);
      setIsModalOpen(false); 
  };

  // 3. Edit Action
  const handleEditAppointment = (event: any) => {
      setEditingData(event); // Pass existing data to modal
      setSelectedEvent(null); // Close sidebar
      setIsModalOpen(true);   // Open modal
  };

  // 4. Delete Action
  const handleDeleteAppointment = async (id: number) => {
      await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedEvent(null);
  };

  // 5. Save Action (Create or Update)
  const handleSaveAppointment = async (data: any) => {
    // Check if we are updating (has ID) or creating
    const method = data.id ? 'PUT' : 'POST'; 
    // Note: Ensure your API handles PUT. If not, use POST for both but handle ID on server.
    // For now, let's assume your POST endpoint handles upsert or we just use POST.
    
    const res = await fetch('/api/appointments', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        setIsModalOpen(false);
        window.location.reload(); 
    } else {
        alert("Failed to save.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200">
          <CalendarView 
            events={appointments} 
            onSlotClick={handleSlotClick} 
            onEventClick={handleEventClick}
            setEvents={setAppointments} 
          />
        </div>
      </div>

      {/* Sidebar Details */}
      <AppointmentDetails 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteAppointment}
        onEdit={handleEditAppointment}
      />

      {/* Modal - Centered, No Blur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Invisible Backdrop (Click to close) */}
            <div className="absolute inset-0 bg-transparent" onClick={() => setIsModalOpen(false)} />
            
            {/* Modal Box */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md z-10">
                <AppointmentModal 
                    isOpen={true} 
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSave={handleSaveAppointment} 
                    initialData={editingData} // Pass data for editing
                />
            </div>
        </div>
      )}
    </div>
  );
}