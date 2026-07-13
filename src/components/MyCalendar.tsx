'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar as any);

const SERVICE_COLORS: Record<string, string> = {
  'First Appointment': '#3b82f6', 
  'First Fitting': '#f59e0b',     
  'Second Fitting': '#8b5cf6',    
  'Pickup': '#10b981',            
  'Rental': '#ec4899',            
};

const CustomToolbar = ({ onNavigate, label, view, onView }: ToolbarProps) => {
  return (
    // 1. MOBILE FIX: flex-col on phones, md:flex-row on desktop. Tighter padding on phones.
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white gap-4">
      
      {/* Top Row on Mobile: Title and Navigation */}
      <div className="flex items-center justify-between w-full md:w-auto md:gap-6">
        <h2 className="text-lg md:text-2xl font-bold text-[#0F172A] tracking-tight">{label}</h2>
        <div className="flex items-center gap-2">
           <button type="button" onClick={() => onNavigate('TODAY')} className="px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Today</button>
           <div className="flex items-center gap-1">
            <button type="button" onClick={() => onNavigate('PREV')} className="p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => onNavigate('NEXT')} className="p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Bottom Row on Mobile: View Switchers (stretches to fill width on phone) */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
        {(['month', 'week', 'day'] as View[]).map((v) => (
          <button 
            key={v} 
            type="button" 
            onClick={() => onView(v)} 
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-medium rounded-md capitalize transition-all ${view === v ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

export interface CalendarViewProps {
  events: any[];
  onSlotClick?: (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => void; 
  onEventClick?: (event: any) => void;
  setEvents?: (events: any[]) => void;
  onEventUpdate?: (args: { event: any, start: Date, end: Date }) => void;
}

export default function MyCalendar({ events, onSlotClick, onEventClick, onEventUpdate }: CalendarViewProps) {
  // We can default to DAY view on mobile if you want, but for now we will keep your WEEK default
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);

  const onEventDrop = useCallback(({ event, start, end }: any) => {
       if (onEventUpdate) onEventUpdate({ event, start, end });
  }, [onEventUpdate]);

  const onEventResize = useCallback(({ event, start, end }: any) => {
      if (onEventUpdate) onEventUpdate({ event, start, end });
  }, [onEventUpdate]);

  const { formats } = useMemo(() => ({
    formats: { eventTimeRangeFormat: () => "" }
  }), []);

  const components = useMemo(() => ({
    toolbar: CustomToolbar,
    event: ({ event }: EventProps<any>) => {
      const clientName = event.title || 'Client';
      const isWedding = event.resource?.type === 'wedding';

      // 2. DRAW OUR OWN GIANT BOX HERE
      if (isWedding) {
        return (
          // Notice we apply the height, color, and rounding directly to this div
<div className="w-full h-[70px] bg-[#D4AF37] rounded-md shadow-md flex items-center justify-center p-2 z-50 relative top-[-4px]">
            <span className="font-bold text-[14px] text-[#0F172A] text-center leading-tight whitespace-normal">
              {clientName}
            </span>
          </div>
        );
      }

      // Standard layout for normal appointments
      return (
        <div className="h-full w-full flex flex-col justify-center px-1 leading-none select-none overflow-hidden">
          <div className="font-bold truncate text-center">{clientName}</div>
        </div>
      );
    },
  }), [view]);

  const eventStyleGetter = useCallback((event: any) => {
      const isWedding = event.resource?.type === 'wedding';

      // NEW: Force the height inline for weddings so the calendar CANNOT ignore it
      // 1. MAKE THE CALENDAR'S WRAPPER INVISIBLE
      if (isWedding) {
          return {
              style: {
                  backgroundColor: 'transparent', // Hide the stubborn default box
                  border: 'none',
                  padding: 0,
                  overflow: 'visible' // Let our new giant box break out!
              }
          };
      }

      // Standard styles for normal appointments
      const serviceName = event.resource?.service?.name;
      const dbColor = event.resource?.service?.color;
      const color = SERVICE_COLORS[serviceName] || dbColor || '#3b82f6';

      return {
          style: {
              backgroundColor: color,
              color: 'white', 
              border: 'none', 
              borderRadius: '2px', 
              display: 'block',
              fontSize: '10px' 
          }
      };
  }, []);

  return (
    // 1. REMOVED 'overflow-hidden' from this main wrapper
    <div className="h-full min-h-[500px] bg-white flex flex-col font-sans w-full">
      <style>{`
        /* UPDATED: Added :not(.wedding-event-large) so it leaves weddings alone! */
        .rbc-month-view .rbc-event:not(.wedding-event-large) {
            padding: 0px 2px !important;
            min-height: 0 !important;
            height: 18px !important; 
            line-height: 18px !important;
            font-size: 10px !important;
            margin-bottom: 1px !important;
        }
        
        .rbc-month-view .rbc-day-bg.rbc-today {
            background-color: #f1f5f9 !important; 
            border: 2px solid #0F172A !important; 
        }

        .rbc-header { padding: 8px 0 !important; font-weight: 600 !important; font-size: 0.75rem; border-bottom: 1px solid #e5e7eb !important; color: #0F172A; }
        @media (min-width: 768px) {
           .rbc-header { padding: 12px 0 !important; font-size: 0.9rem; }
        }

        .rbc-allday-cell { display: none !important; }
        .rbc-time-view { border-top: 1px solid #e5e7eb; }
        .rbc-timeslot-group { min-height: 60px !important; }
        .rbc-time-view .rbc-today { background-color: #f8fafc !important; }
      `}</style>

      {/* 2. ADDED THIS SWIPEABLE WRAPPER */}
      <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
        {/* 3. FORCED MINIMUM WIDTH: This ensures the 7 columns never squish smaller than 800px */}
        <div className="min-w-[800px] h-full">
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            onView={setView}
            date={date}
            onNavigate={handleNavigate} 
            startAccessor={(e: any) => new Date(e.start)}
            endAccessor={(e: any) => new Date(e.end)}
            min={new Date(0, 0, 0, 8, 0, 0)}   
            max={new Date(0, 0, 0, 23, 59, 59)}  
            scrollToTime={new Date(0, 0, 0, 8, 0, 0)}
            step={15}
            timeslots={4}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            resizable
            selectable={true}
            onSelectSlot={(slotInfo: any) => { if (onSlotClick) onSlotClick(slotInfo); }}
            onSelectEvent={(event) => { if (onEventClick) onEventClick(event); }}
            components={components}
            formats={formats} 
            eventPropGetter={eventStyleGetter}
            className="flex-1"
            popup={true} 
          />
        </div>
      </div>
    </div>
  );
}