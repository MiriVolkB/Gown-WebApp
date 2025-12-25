'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- 1. DISTINCT COLORS MAP ---
// Updated with very different colors to avoid "shades of blue"
const STATIC_COLORS: Record<string, string> = {
  'consultation': '#9333ea',   // Vibrant Purple
  'first fitting': '#ea580c',  // Deep Orange
  'second fitting': '#db2777', // Pink/Magenta
  'final fitting': '#16a34a',  // Green
  'pickup': '#dc2626',         // Red
  'alteration': '#0891b2',     // Teal
  'wedding day': '#ca8a04',    // Gold
};

// --- 2. CUSTOM CONTENT (SHOWS CLIENT NAME) ---
const CustomEventContent = ({ event }: any) => {
  // Try to find the client name in a few different places to be safe
  const clientName = event.resource?.client?.name || event.title || 'Client Name';
  const serviceName = event.resource?.service?.name || '';

  return (
    <div className="h-full w-full px-1 py-0.5 overflow-hidden flex flex-col">
      {/* Client Name: Bold and prominent */}
      <div className="font-bold text-white text-xs leading-tight truncate">
        {clientName}
      </div>
      
      {/* Service Name: Smaller, underneath */}
      {serviceName && (
        <div className="text-white/90 text-[10px] leading-tight truncate mt-0.5">
          {serviceName}
        </div>
      )}
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

  // --- STYLE GETTER (HANDLES COLORS) ---
  const eventStyleGetter = (event: any) => {
    // Safely get service name, lowercased for matching
    const serviceNameRaw = event.resource?.service?.name || event.title || '';
    const serviceName = serviceNameRaw.toLowerCase().trim();
    
    // Logic: 
    // 1. Check if the event object has a specific color assigned (backend)
    // 2. Check our STATIC_COLORS map
    // 3. Fallback to a standard Blue if nothing matches
    const backgroundColor = 
      event.resource?.service?.color || 
      STATIC_COLORS[serviceName] || 
      '#2563eb'; // Default Blue

    return {
      style: {
        backgroundColor: backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        opacity: 0.9,
        display: 'block'
      }
    };
  };

  return (
    // --- 3. HEIGHT FIX ---
    // Changed to h-[1200px] to make the calendar physically taller.
    // This creates "wider" slots and forces a scrollbar, preventing the "smashed" look.
    <div className="h-[1200px] bg-white p-4 overflow-y-auto">
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
        
        // Use our custom component to show Client Name
        components={{ 
            event: CustomEventContent 
        }}
        
        // Apply our colors
        eventPropGetter={eventStyleGetter}
        
        selectable={true}
        onSelectSlot={(slotInfo) => {
            if (onSlotClick) onSlotClick(slotInfo);
        }}
      />
    </div>
  );
}