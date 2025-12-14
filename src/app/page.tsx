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

        const formattedEvents = data.map((app: any) => {
          const startDate = new Date(app.start);
          let endDate = new Date(app.end);

          // --- SMART DURATION FIX ---
          // 1. Calculate duration in milliseconds
          const duration = endDate.getTime() - startDate.getTime();

          // 2. If duration is less than 15 mins (or negative/invalid), 
          //    it's likely an error. Default to 30 mins so you can see it.
          //    Otherwise, KEEP THE REAL END TIME.
          if (isNaN(duration) || duration < 1000 * 60 * 15) {
             endDate = new Date(startDate.getTime() + 30 * 60000); // Default to 30 mins
          }

          return {
            id: app.id,
            // Title shows: "Client Name" (or Service if no client)
            title: app.client ? `${app.client.name}` : (app.service?.name || 'Appointment'),
            start: startDate,
            end: endDate, 
            resource: app
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
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
          <h1 className="text-3xl font-serif text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1 text-sm">Click any time slot to book an appointment</p>
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