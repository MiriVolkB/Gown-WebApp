'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfDay, isBefore } from 'date-fns';
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
  'Other': '#64748b',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}

const CustomToolbar = ({
  onNavigate,
  label,
  view,
  onView,
  isMobile,
  availableViews,
}: ToolbarProps & { isMobile: boolean; availableViews: View[] }) => {
  return (
    <div className="flex flex-col gap-3 px-3 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 w-full">
        <h2 className="text-base md:text-2xl font-bold text-[#0F172A] tracking-tight truncate min-w-0">
          {label}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('TODAY')}
            className="px-2.5 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onNavigate('PREV')}
              className="p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('NEXT')}
              className="p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
        {availableViews.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onView(v)}
            className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md capitalize transition-all ${
              view === v
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {isMobile && view !== 'month' && (
        <p className="text-[11px] text-slate-400 text-center">
          Swipe sideways to see more
        </p>
      )}
    </div>
  );
};

export interface CalendarViewProps {
  events: any[];
  onSlotClick?: (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => void;
  onEventClick?: (event: any) => void;
  setEvents?: (events: any[]) => void;
  onEventUpdate?: (args: { event: any; start: Date; end: Date }) => void;
}

export default function MyCalendar({ events, onSlotClick, onEventClick, onEventUpdate }: CalendarViewProps) {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const availableViews: View[] = [Views.MONTH, Views.WEEK, Views.DAY];

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);

  const onEventDrop = useCallback(
    ({ event, start, end }: any) => {
      if (onEventUpdate) onEventUpdate({ event, start, end });
    },
    [onEventUpdate]
  );

  const onEventResize = useCallback(
    ({ event, start, end }: any) => {
      if (onEventUpdate) onEventUpdate({ event, start, end });
    },
    [onEventUpdate]
  );

  const { formats } = useMemo(
    () => ({
      formats: { eventTimeRangeFormat: () => '' },
    }),
    []
  );

  const components = useMemo(
    () => ({
      toolbar: (props: ToolbarProps) => (
        <CustomToolbar
          {...props}
          isMobile={isMobile}
          availableViews={availableViews}
        />
      ),
      event: ({ event }: EventProps<any>) => {
        const clientName = event.title || 'Client';
        const isWedding = event.resource?.type === 'wedding';

        if (isWedding) {
          return (
            <div className="w-full h-full min-h-[44px] md:min-h-[70px] bg-[#D4AF37] rounded-md shadow-md flex items-center justify-center p-1 md:p-2 z-50 relative">
              <span className="font-bold text-[11px] md:text-[14px] text-[#0F172A] text-center leading-tight whitespace-normal">
                {clientName}
              </span>
            </div>
          );
        }

        return (
          <div className="h-full w-full flex flex-col justify-center px-0.5 md:px-1 leading-none select-none overflow-hidden">
            <div className="font-bold truncate text-center text-[10px] md:text-xs">{clientName}</div>
          </div>
        );
      },
    }),
    [isMobile, availableViews]
  );

  const eventStyleGetter = useCallback((event: any) => {
    const isWedding = event.resource?.type === 'wedding';

    if (isWedding) {
      return {
        style: {
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          overflow: 'visible',
        },
      };
    }

    const serviceName = event.resource?.service?.name;
    const dbColor = event.resource?.service?.color;
    const color = SERVICE_COLORS[serviceName] || dbColor || '#3b82f6';

    return {
      style: {
        backgroundColor: color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        display: 'block',
        fontSize: '10px',
      },
    };
  }, []);

  const dayPropGetter = useCallback((day: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(startOfDay(day), today)) {
      return { className: 'rbc-past-day' };
    }
    return {};
  }, []);

  const needsHorizontalScroll = view === Views.WEEK || (isMobile && view === Views.DAY);

  return (
    <div className="h-full min-h-[420px] md:min-h-[500px] bg-white flex flex-col font-sans w-full">
      <style>{`
        .rbc-calendar { height: 100%; display: flex; flex-direction: column; }
        .rbc-month-view .rbc-event:not(.wedding-event-large) {
          padding: 0px 2px !important;
          min-height: 0 !important;
          height: 18px !important;
          line-height: 18px !important;
          font-size: 10px !important;
          margin-bottom: 1px !important;
        }
        @media (max-width: 767px) {
          .rbc-month-view .rbc-event:not(.wedding-event-large) {
            height: 16px !important;
            line-height: 16px !important;
            font-size: 9px !important;
          }
          .rbc-month-row { min-height: 64px !important; }
          .rbc-date-cell { padding: 2px 4px !important; font-size: 11px !important; }
          .rbc-header { padding: 6px 0 !important; font-size: 0.7rem !important; }
          .rbc-timeslot-group { min-height: 48px !important; }
          .rbc-time-gutter .rbc-label { font-size: 10px !important; padding: 0 4px !important; }
          .rbc-event, .rbc-addons-dnd-resizable {
            touch-action: none;
          }
        }
        .rbc-month-view .rbc-day-bg.rbc-today {
          background-color: #f8fafc !important;
          border: 2px solid #0F172A !important;
        }
        /* Past days — slightly gray like home appointments */
        .rbc-day-bg.rbc-past-day,
        .rbc-time-content .rbc-day-slot.rbc-past-day,
        .rbc-time-header-content .rbc-header.rbc-past-day {
          background-color: #e8edf2 !important;
        }
        .rbc-date-cell.rbc-past-day,
        .rbc-date-cell.rbc-past-day a {
          color: #94a3b8 !important;
        }
        .rbc-month-view .rbc-day-bg.rbc-past-day.rbc-off-range-bg {
          background-color: #e2e8f0 !important;
        }
        .rbc-header {
          padding: 8px 0 !important;
          font-weight: 600 !important;
          font-size: 0.75rem;
          border-bottom: 1px solid #e5e7eb !important;
          color: #0F172A;
        }
        @media (min-width: 768px) {
          .rbc-header { padding: 12px 0 !important; font-size: 0.9rem; }
        }
        .rbc-allday-cell { display: none !important; }
        .rbc-time-view { border-top: 1px solid #e5e7eb; }
        .rbc-timeslot-group { min-height: 60px !important; }
        .rbc-time-view .rbc-today { background-color: #f8fafc !important; }
        .rbc-time-view .rbc-day-slot.rbc-past-day {
          background-color: #e8edf2 !important;
        }
        .calendar-scroll::-webkit-scrollbar { display: none; }
        .calendar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className={`flex-1 w-full min-h-0 ${
          needsHorizontalScroll ? 'overflow-x-auto calendar-scroll' : 'overflow-hidden'
        }`}
      >
        <div className={`h-full ${needsHorizontalScroll ? 'min-w-[720px] md:min-w-[800px]' : 'w-full'}`}>
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            onView={setView}
            views={availableViews}
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
            draggableAccessor={() => true}
            resizable
            selectable
            onSelectSlot={(slotInfo: any) => {
              if (onSlotClick) onSlotClick(slotInfo);
            }}
            onSelectEvent={(event) => {
              if (onEventClick) onEventClick(event);
            }}
            components={components}
            formats={formats}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            className="flex-1"
            popup
            length={isMobile ? 2 : 3}
          />
        </div>
      </div>
    </div>
  );
}
