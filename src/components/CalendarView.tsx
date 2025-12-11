'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';

// --- FIXED IMPORTS START ---
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
// --- FIXED IMPORTS END ---

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the Date Localizer
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
// Custom "Event" Card (Matches your Figma Look)
const CustomEvent = ({ event }: any) => {
  const { client, service } = event.resource;
  return (
    <div className="h-full w-full bg-white border-l-4 rounded shadow-sm p-1 overflow-hidden text-xs leading-tight"
         style={{ borderLeftColor: service?.color || '#cbd5e1' }}>
      <div className="font-bold text-slate-800 truncate">{client?.name || 'Unknown Client'}</div>
      <div className="text-slate-500 truncate">{service?.name || 'Service'}</div>
    </div>
  );
};

export default function CalendarView() {
  const [view, setView] = useState<View>(Views.WEEK);
  const [events, setEvents] = useState<any[]>([]);

  // Fetch Appointments from your API
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch('/api/appointments');
        const data = await res.json();
        
        // Transform database data into Calendar events
        const calendarEvents = data.map((appt: any) => ({
          id: appt.id,
          title: appt.client?.name,
          start: new Date(appt.start),
          end: new Date(appt.end),
          resource: appt,
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to load appointments:", error);
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
        eventPropGetter={() => ({
            style: { backgroundColor: 'transparent', border: 'none', padding: 0 } 
        })}
      />
    </div>
  );
}