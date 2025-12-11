// src/app/calendar/page.tsx
'use client';

import React, { useState } from 'react';
import CalendarView from '@/components/CalendarView';
import AppointmentModal from '@/components/AppointmentModal';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // This function runs when you click a time slot
  const handleCalendarClick = (slotInfo: { start: Date }) => {
    console.log("Clicked date:", slotInfo.start); // Debugging check
    setSelectedDate(slotInfo.start); 
    setIsModalOpen(true);            
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
          <h1 className="text-3xl font-serif text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1 text-sm">Click any time slot to book an appointment</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Pass the click handler to the calendar */}
        <CalendarView onSlotClick={handleCalendarClick} />
      </div>

      {/* The Modal pops up here */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate} 
      />
    </div>
  );
}