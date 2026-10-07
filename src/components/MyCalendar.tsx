'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfDay, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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

// In the Weddings month view, a day with MORE than this many weddings
// is shown as one summary pill ("3 weddings") that opens a popup.
const MAX_WEDDINGS_PER_DAY = 2;

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

// Plain family name for a wedding event (no emoji, no "'s Wedding")
function weddingName(event: any): string {
  return (event?.resource?.name || event?.title || 'Client').toString();
}

// Number of gowns for a wedding event (null if the server didn't send it)
function weddingGownCount(event: any): number | null {
  const n = event?.resource?._count?.projects;
  return typeof n === 'number' ? n : null;
}

function gownLabel(n: number): string {
  return `${n} ${n === 1 ? 'gown' : 'gowns'}`;
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

// Default event look (used by Appointments in every view, and by weddings in the week view)
const DefaultEvent = ({ event }: { event: any }) => {
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
};

// Month view only: compact one-line wedding pills + a summary pill for busy days
const MonthEvent = ({ event }: EventProps<any>) => {
  const type = event.resource?.type;

  if (type === 'wedding-group') {
    const count = event.resource?.weddings?.length ?? 0;
    return (
      <div className="w-full h-[18px] md:h-[20px] bg-[#0F172A] rounded px-1.5 flex items-center justify-center overflow-hidden cursor-pointer">
        <span className="truncate text-[10px] md:text-[12px] font-bold text-[#D4AF37] leading-none">
          {count} weddings
        </span>
      </div>
    );
  }

  if (type === 'wedding') {
    return (
      <div className="w-full h-[18px] md:h-[20px] bg-[#D4AF37] rounded px-1.5 flex items-center overflow-hidden">
        <span
          dir="auto"
          className="min-w-0 truncate text-start text-[10px] md:text-[12px] font-semibold text-[#0F172A] leading-none"
        >
          {weddingName(event)}
        </span>
      </div>
    );
  }

  return <DefaultEvent event={event} />;
};

export interface CalendarViewProps {
  events: any[];
  onSlotClick?: (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => void;
  onEventClick?: (event: any) => void;
  setEvents?: (events: any[]) => void;
  onEventUpdate?: (args: { event: any; start: Date; end: Date }) => void;
  isWeddingView?: boolean;
}

export default function MyCalendar({ events, onSlotClick, onEventClick, onEventUpdate, isWeddingView = false }: CalendarViewProps) {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [groupPopup, setGroupPopup] = useState<{ day: Date; weddings: any[] } | null>(null);

  // Weddings don't need a Day view, only Month and Week
  const availableViews = useMemo<View[]>(
    () => (isWeddingView ? [Views.MONTH, Views.WEEK] : [Views.MONTH, Views.WEEK, Views.DAY]),
    [isWeddingView]
  );

  // If someone is on Day view and switches to Weddings, fall back to Week
  useEffect(() => {
    if (isWeddingView && view === Views.DAY) setView(Views.WEEK);
  }, [isWeddingView, view]);

  // Never give the calendar a view that isn't available (prevents a crash on tab switch)
  const currentView: View = isWeddingView && view === Views.DAY ? Views.WEEK : view;

  // Weddings month view: days with more than MAX_WEDDINGS_PER_DAY weddings become one summary pill
  const displayEvents = useMemo(() => {
    if (!isWeddingView || currentView !== Views.MONTH) return events;

    const byDay = new Map<string, any[]>();
    for (const e of events) {
      const key = format(new Date(e.start), 'yyyy-MM-dd');
      byDay.set(key, [...(byDay.get(key) || []), e]);
    }

    const result: any[] = [];
    byDay.forEach((dayEvents, key) => {
      if (dayEvents.length <= MAX_WEDDINGS_PER_DAY) {
        result.push(...dayEvents);
        return;
      }
      result.push({
        id: `wedding-group-${key}`,
        title: `${dayEvents.length} weddings`,
        start: dayEvents[0].start,
        end: dayEvents[0].end,
        allDay: true,
        className: ['wedding-event-large'],
        resource: { type: 'wedding-group', weddings: dayEvents },
      });
    });
    return result;
  }, [events, isWeddingView, currentView]);

  // Close the weddings popup with the Escape key
  useEffect(() => {
    if (!groupPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGroupPopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [groupPopup]);

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);

  const onEventDrop = useCallback(
    ({ event, start, end }: any) => {
      if (event?.resource?.type === 'wedding-group') return;
      if (onEventUpdate) onEventUpdate({ event, start, end });
    },
    [onEventUpdate]
  );

  const onEventResize = useCallback(
    ({ event, start, end }: any) => {
      if (event?.resource?.type === 'wedding-group') return;
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
      event: DefaultEvent,
      month: { event: MonthEvent },
    }),
    [isMobile, availableViews]
  );

  const eventStyleGetter = useCallback((event: any) => {
    const type = event.resource?.type;
    const isWedding = type === 'wedding' || type === 'wedding-group';

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

  const needsHorizontalScroll = currentView === Views.WEEK || (isMobile && currentView === Views.DAY);

  return (
    <div className="h-full min-h-0 bg-white flex flex-col font-sans w-full">
      <style>{`
        .rbc-calendar {
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        /* Month view must share height with the toolbar — height:100% overflows and clips the last row */
        .rbc-month-view {
          flex: 1 1 0 !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .rbc-month-row {
          flex: 1 1 0 !important;
          min-height: 0 !important;
        }
        .rbc-time-view {
          flex: 1 1 0 !important;
          min-height: 0 !important;
          border-top: 1px solid #e5e7eb;
        }
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
          /* inset shadow so the today ring isn't clipped by row overflow:hidden */
          box-shadow: inset 0 0 0 2px #0F172A !important;
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
            events={displayEvents}
            view={currentView}
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
            draggableAccessor={(e: any) => e?.resource?.type !== 'wedding-group'}
            resizable
            selectable
            onSelectSlot={(slotInfo: any) => {
              if (onSlotClick) onSlotClick(slotInfo);
            }}
            onSelectEvent={(event: any) => {
              if (event?.resource?.type === 'wedding-group') {
                setGroupPopup({
                  day: new Date(event.start),
                  weddings: event.resource.weddings || [],
                });
                return;
              }
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

      {groupPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupPopup(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm max-h-[80dvh] flex flex-col">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {format(groupPopup.day, 'EEEE, MMMM d')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(() => {
                    const counts = groupPopup.weddings.map(weddingGownCount);
                    const known = counts.every((c) => c !== null);
                    const total = counts.reduce<number>((sum, c) => sum + (c ?? 0), 0);
                    return known
                      ? `${groupPopup.weddings.length} weddings · ${gownLabel(total)}`
                      : `${groupPopup.weddings.length} weddings`;
                  })()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGroupPopup(null)}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 flex flex-col gap-2">
              {groupPopup.weddings.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  dir="auto"
                  onClick={() => {
                    setGroupPopup(null);
                    if (onEventClick) onEventClick(w);
                  }}
                  className="w-full flex items-center justify-between gap-3 text-start px-4 py-3 rounded-lg bg-[#D4AF37] text-[#0F172A] font-semibold text-sm hover:brightness-95 transition"
                >
                  <span className="min-w-0 truncate">{weddingName(w)}</span>
                  {weddingGownCount(w) !== null && (
                    <span className="shrink-0 text-xs font-medium opacity-80">
                      {gownLabel(weddingGownCount(w) as number)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}