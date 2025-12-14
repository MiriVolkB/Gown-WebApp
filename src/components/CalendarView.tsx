'use client';

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 1. SETUP LOCALIZER
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// 2. THE "GOOGLE STYLE" EVENT COMPONENT
// This turns the "grey stuff" into colored blocks
const CustomEvent = ({ event }: any) => {
  const { client, service } = event.resource || {};
  
  // Use the service color, or default to a nice Google Blue if missing
  const bgColor = service?.color || '#3b82f6'; 

  return (
    <div 
      className="h-full w-full rounded-md shadow-sm px-2 py-1 overflow-hidden text-xs leading-tight hover:opacity-90 transition-opacity"
      style={{ 
        backgroundColor: bgColor, 
        color: '#fff', // White text for contrast
        borderLeft: '4px solid rgba(0,0,0,0.2)' // Subtle darker border on left
      }}
    >
      <div className="font-bold truncate">{client?.name || 'Unknown Client'}</div>
      <div className="opacity-90 truncate text-[10px]">{service?.name || 'Service'}</div>
    </div>
  );
};

// 3. DEFINE PROPS
interface CalendarProps {
  events: any[]; // <--- We now accept events passed from the parent!
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function CalendarView({ events, onSlotClick }: CalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);

  return (
    <div className="h-[600px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <Calendar
        localizer={localizer}
        events={events} // Use the events passed down from CalendarPage
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        components={{ 
            event: CustomEvent // Use our new colored block component
        }}
        
        selectable={true}
        onSelectSlot={(slotInfo) => {
            if (onSlotClick) onSlotClick(slotInfo);
        }}
        
        // This removes the default ugly styling so our CustomEvent takes over
        eventPropGetter={() => ({
            style: { 
                backgroundColor: 'transparent', 
                border: 'none', 
                padding: 0,
                boxShadow: 'none'
            } 
        })}
      />
    </div>
  );
}