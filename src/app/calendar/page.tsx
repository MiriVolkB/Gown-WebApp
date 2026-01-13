'use client';

import React, { useState, useEffect } from 'react';
import CalendarView from '../../components/MyCalendar';
import AppointmentModal from '../../components/AppointmentModal';
import AppointmentDetails from '../../components/AppointmentDetails';
import MoveConfirmationModal from '../../components/MoveConfirmationModal'; // <--- Import New Modal

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editingData, setEditingData] = useState<any | null>(null);

  // --- NEW STATE for the Drag Modal ---
  const [moveData, setMoveData] = useState<any | null>(null); 

  const fetchAppointments = () => {
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
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 1. When you drag, we JUST open the confirmation modal
  const handleEventUpdate = ({ event, start, end }: any) => {
    setMoveData({ event, start, end });
  };

  // 2. The user clicked "Confirm Move" in the modal
  const handleConfirmMove = async (notifyClient: boolean) => {
    if (!moveData) return;

    const { event, start, end } = moveData;

    // Optimistic Update
    const updatedEvents = appointments.map((evt) => 
      evt.id === event.id ? { ...evt, start, end } : evt
    );
    setAppointments(updatedEvents);
    
    // Close modal immediately
    setMoveData(null); 

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: event.id,
                start: start,
                end: end,
                clientId: event.resource.clientId,
                serviceName: event.resource.service.name,
                notes: event.resource.notes,
                notify: notifyClient // <--- Sending this to backend!
            }),
        });

        if (!res.ok) {
            alert("Failed to move appointment");
            fetchAppointments(); 
        }
    } catch (error) {
        console.error("Move failed", error);
        fetchAppointments(); 
    }
  };

  // Standard handlers...
  const handleSlotClick = (slotInfo: { start: Date }) => {
    const date = slotInfo.start;
    setSelectedDate(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
    setEditingData(null);
    setSelectedEvent(null);
    setIsModalOpen(true);            
  };

  const handleEventClick = (event: any) => {
      setSelectedEvent(event);
      setIsModalOpen(false); 
  };

  const handleEditAppointment = (event: any) => {
      setEditingData(event);
      setSelectedEvent(null);
      setIsModalOpen(true);   
  };

  const handleDeleteAppointment = async (id: number) => {
      await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedEvent(null);
  };

  const handleSaveAppointment = async (data: any) => {
    setIsModalOpen(false);
    fetchAppointments(); 
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <div className="px-8 py-6 bg-white border-b border-slate-200">
          <h1 className="text-3xl font-bold text-[#0F172A]">Calendar</h1>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200">
          <CalendarView 
            events={appointments} 
            onSlotClick={handleSlotClick} 
            onEventClick={handleEventClick}
            setEvents={setAppointments} 
            onEventUpdate={handleEventUpdate} 
          />
        </div>
      </div>

      <AppointmentDetails 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteAppointment}
        onEdit={handleEditAppointment}
      />

      {/* Appointment Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-transparent" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md z-10">
                <AppointmentModal 
                    isOpen={true} 
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSave={handleSaveAppointment} 
                    initialData={editingData} 
                />
            </div>
        </div>
      )}

      {/* --- NEW: The Drag Confirmation Modal --- */}
      {moveData && (
        <MoveConfirmationModal 
          isOpen={!!moveData}
          event={moveData.event}
          newStart={moveData.start}
          newEnd={moveData.end}
          onClose={() => {
            setMoveData(null); // Cancel drag
            fetchAppointments(); // Snap back visually
          }}
          onConfirm={handleConfirmMove}
        />
      )}
    </div>
  );
}