'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- FALLBACK COLOR MAP ---
const STATIC_COLORS: Record<string, string> = {
  'consultation': '#10b981',   // Green
  'first fitting': '#3b82f6',  // Blue
  'second fitting': '#8b5cf6', // Purple
  'final fitting': '#f59e0b',  // Orange
  'pickup': '#ec4899',         // Pink
};

// --- CONTENT COMPONENT (FIXED FOR SPACING) ---
const CustomEventContent = ({ event }: any) => {
  const { client, service } = event.resource;

  return (
    // FIX: Changed 'p-1' to 'px-1 py-0.5' to reduce top/bottom padding
    // FIX: Added 'overflow-hidden' to strictly clip text that is too long
    <div className="h-full w-full px-1 py-0.5 overflow-hidden flex flex-col justify-center">
      
      {/* Client Name: Bold, slightly smaller text to fit */}
      <div className="font-bold text-white text-[11px] leading-3 truncate">
        {client?.name || 'Unknown'}
      </div>
      
      {/* Service Name: Tiny text, no top margin */}
      <div className="text-white opacity-90 text-[9px] leading-3 truncate">
        {service?.name || 'Service'}
      </div>
    </div>
  );
};

interface CalendarProps {
  events: any[];
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function CalendarView({ events, onSlotClick }: CalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);

  // Time: 8 AM to Midnight
  const minTime = useMemo(() => {
    const t = new Date();
    t.setHours(8, 0, 0); 
    return t;
  }, []);

  const maxTime = useMemo(() => {
    const t = new Date();
    t.setHours(23, 59, 59); 
    return t;
  }, []);

  // --- STYLE GETTER ---
  const eventStyleGetter = (event: any) => {
    const service = event.resource.service || {};
    const serviceName = (service.name || '').toLowerCase().trim();
    
    // Priority: DB Color -> Static Map -> Default Blue
    const backgroundColor = service.color || STATIC_COLORS[serviceName] || '#039BE5';

    return {
      style: {
        backgroundColor: backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '3px', // Slightly sharper corners look better on small blocks
        display: 'block'
      }
    };
  };

  return (
    <div className="h-[calc(100vh-180px)] bg-white p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        
        min={minTime}
        max={maxTime}
        
        views={['month', 'week', 'day']} 
        
        components={{ 
            event: CustomEventContent 
        }}
        
        eventPropGetter={eventStyleGetter}
        
        selectable={true}
        onSelectSlot={(slotInfo) => {
            if (onSlotClick) onSlotClick(slotInfo);
        }}
      />
    </div>
  );
}