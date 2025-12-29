'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

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
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{label}</h2>
        <div className="flex items-center gap-2">
           <button type="button" onClick={() => onNavigate('TODAY')} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Today</button>
           <div className="flex items-center gap-1">
            <button type="button" onClick={() => onNavigate('PREV')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => onNavigate('NEXT')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {(['month', 'week', 'day'] as View[]).map((v) => (
          <button key={v} type="button" onClick={() => onView(v)} className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${view === v ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{v}</button>
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
      return (
        <div className="h-full w-full flex flex-col justify-center px-1 leading-none select-none overflow-hidden">
          <div className="font-bold truncate text-center">{clientName}</div>
        </div>
      );
    },
  }), [view]);

  const eventStyleGetter = useCallback((event: any) => {
      const serviceName = event.resource?.service?.name;
      const dbColor = event.resource?.service?.color;
      const color = SERVICE_COLORS[serviceName] || dbColor || '#3b82f6';

      return {
        style: {
          backgroundColor: color,
          color: 'white', 
          border: 'none', 
          borderRadius: '2px', // Tighter radius
          display: 'block',
          fontSize: '10px' // Base font size
        }
      }
  }, []);

  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <style>{`
        /* COMPACT MONTH VIEW EVENTS */
        .rbc-month-view .rbc-event {
            padding: 0px 2px !important;
            min-height: 0 !important;
            height: 18px !important; /* Forces them small */
            line-height: 18px !important;
            font-size: 10px !important;
            margin-bottom: 1px !important;
        }
        
        /* Today Highlight */
        .rbc-month-view .rbc-day-bg.rbc-today {
            background-color: #f1f5f9 !important; 
            border: 2px solid #0F172A !important; 
        }

        .rbc-header { padding: 12px 0 !important; font-weight: 600 !important; font-size: 0.9rem; border-bottom: 1px solid #e5e7eb !important; color: #0F172A; }
        .rbc-allday-cell { display: none !important; }
        .rbc-time-view { border-top: 1px solid #e5e7eb; }
        .rbc-timeslot-group { min-height: 60px !important; }
        .rbc-time-view .rbc-today { background-color: #f8fafc !important; }
      `}</style>

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
        popup={true} // Enables popup if they STILL don't fit
      />
    </div>
  );
}