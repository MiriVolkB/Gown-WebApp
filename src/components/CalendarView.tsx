// src/components/CalendarView.tsx
'use client';

// ... (Your imports are fine, keep them) ...
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// ... (Your localizer code is fine, keep it) ...
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Custom Event Card
const CustomEvent = ({ event }: any) => {
  const { client, service } = event.resource;
  return (
    <div className="h-full w-full bg-white border-l-4 rounded shadow-sm p-1 overflow-hidden text-xs leading-tight"
         style={{ borderLeftColor: service?.color || '#cbd5e1' }}>
      <div className="font-bold text-slate-800 truncate">{client?.name || 'Unknown'}</div>
      <div className="text-slate-500 truncate">{service?.name || 'Service'}</div>
    </div>
  );
};

// --- THIS IS THE PART TO CHANGE ---
interface CalendarProps {
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void; // Add this!
}

export default function CalendarView({ onSlotClick }: CalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [events, setEvents] = useState<any[]>([]);

useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch('/api/appointments');
        const data = await res.json();

        // SAFETY CHECK: Is 'data' actually an array (list)?
        if (!Array.isArray(data)) {
            console.error("API Error: Expected an array but got:", data);
            return; // Stop here so we don't crash
        }
        
        // If it IS an array, proceed as normal
        const calendarEvents = data.map((appt: any) => ({
          id: appt.id,
          title: appt.client?.name || "Unknown Client", // Safety fallback
          start: new Date(appt.start),
          end: new Date(appt.end),
          resource: appt,
        }));
        setEvents(calendarEvents);
      } catch (e) { 
        console.error("Network Error:", e); 
      }
    }
    fetchAppointments();
  }, []);
  
  return (
    <div className="h-[600px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        components={{ event: CustomEvent }}
        
        // --- ADD THESE LINES TO ENABLE CLICKING ---
        selectable={true} 
        onSelectSlot={(slotInfo) => {
            if (onSlotClick) onSlotClick(slotInfo);
        }}
        // ----------------------------------------
        
        eventPropGetter={() => ({
            style: { backgroundColor: 'transparent', border: 'none', padding: 0 } 
        })}
      />
    </div>
  );
}