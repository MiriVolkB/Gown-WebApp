'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import CalendarView from '@/components/CalendarView';
import AppointmentModal from '@/components/AppointmentModal';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // 1. NEW STATE: Hold the list of appointments
  const [appointments, setAppointments] = useState([]);

  // 2. NEW EFFECT: Load appointments when the page opens
  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        const formattedEvents = data.map((app: any) => {
          // 1. Create Date objects
          const startDate = new Date(app.start);
          let endDate = new Date(app.end);

          // 2. FORCE DURATION: If end time is invalid or same as start, add 1 hour
          if (isNaN(endDate.getTime()) || endDate <= startDate) {
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour (60m * 60s * 1000ms)
          }

          return {
            id: app.id,
            // 3. TITLE: Combine Client Name + Service for the main label
            title: `${app.client?.name || 'Client'} - ${app.service?.name || 'Service'}`, 
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
        {/* 3. PASS THE EVENTS TO THE CALENDAR */}
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