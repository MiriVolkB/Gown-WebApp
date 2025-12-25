'use client';

import React, { useState, useEffect } from 'react';
import CalendarView from '@/components/CalendarView';
import AppointmentModal from '@/components/AppointmentModal';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        // Map strictly according to your Prisma Schema
        const formattedEvents = data.map((appt: any) => {
          const startDate = new Date(appt.start);
          let endDate = new Date(appt.end);

          // Safety: If duration is 0 or invalid, force 30 mins
          const duration = endDate.getTime() - startDate.getTime();
          if (isNaN(duration) || duration <= 0) {
             endDate = new Date(startDate.getTime() + 30 * 60000); 
          }

          return {
            id: appt.id,
            // Strict Schema Access: Client Name and Service Name
            title: appt.client?.name || 'Unknown Client', 
            start: startDate,
            end: endDate, 
            resource: {
                // Pass the whole object so we can access everything in the view
                client: appt.client,
                service: appt.service,
                status: appt.status,
                notes: appt.notes
            }
          };
        });

        setAppointments(formattedEvents);
      })
      .catch(err => console.error("Failed to load calendar:", err));
  }, []);

  const handleCalendarClick = (slotInfo: { start: Date }) => {
    const clickedDate = slotInfo.start;
    const hours = clickedDate.getHours().toString().padStart(2, '0');
    const minutes = clickedDate.getMinutes().toString().padStart(2, '0');
    
    setSelectedDate(clickedDate);
    setSelectedTime(`${hours}:${minutes}`);
    setIsModalOpen(true);            
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        window.location.reload(); 
      } else {
        alert("Failed to save appointment.");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col bg-zinc-50">
      <div className="mb-6">
          <h1 className="text-3xl font-serif text-slate-900">Calendar</h1>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <CalendarView 
          events={appointments} 
          onSlotClick={handleCalendarClick} 
        />
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSave={handleSaveAppointment} 
      />
    </div>
  );
}