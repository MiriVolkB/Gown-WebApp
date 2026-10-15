'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, ToolbarProps, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfDay, isBefore, differenceInCalendarDays } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight, X, Phone, Clock } from 'lucide-react';
import { GownIcon } from '@/components/icons/GownIcon';

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

// In the Weddings week view each wedding is a card, so there is more room:
// a day with MORE than this many weddings shows the first ones plus a "+N more" pill.
const MAX_WEDDING_CARDS_PER_DAY = 4;

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

// Phone number for a wedding event (empty string if the server didn't send one)
function weddingPhone(event: any): string {
  const phone = event?.resource?.phone;
  return typeof phone === 'string' ? phone.trim() : '';
}

// Make a plain string of digits look like a phone number: 0583221457 -> 058-322-1457
// (anything that already has spaces, dashes or a "+" is shown exactly as typed)
function formatPhone(raw: string): string {
  if (!/^\d+$/.test(raw)) return raw;
  if (raw.length === 10) return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
  if (raw.length === 9) return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5)}`;
  return raw;
}

// "Today", "Tomorrow", "In 4 days", "Yesterday", "3 days ago"
function weddingCountdown(start: Date | string): string {
  const days = differenceInCalendarDays(startOfDay(new Date(start)), startOfDay(new Date()));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
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

// Week view: wedding cards (name, gowns, phone, countdown) + a "+N more" pill for busy days
const WeekEvent = ({ event }: EventProps<any>) => {
  const type = event.resource?.type;

  if (type === 'wedding-group') {
    const extra = event.resource?.extra ?? 0;
    return (
      <div className="w-full bg-[#0F172A] rounded-md px-2 py-1.5 flex items-center justify-center cursor-pointer">
        <span className="text-[12px] font-bold text-[#D4AF37] leading-tight">+{extra} more</span>
      </div>
    );
  }

  if (type === 'wedding') {
    const gowns = weddingGownCount(event);
    const phone = weddingPhone(event);
    const countdown = weddingCountdown(event.start);
    const isToday = countdown === 'Today';
    const isPast = isBefore(startOfDay(new Date(event.start)), startOfDay(new Date()));
    return (
      <div className="w-full bg-[#D4AF37] rounded-md shadow-sm px-2.5 py-2 flex flex-col gap-1.5 text-start text-[#0F172A] cursor-pointer overflow-hidden">
        <span dir="auto" className="font-bold text-[14px] leading-tight break-words">
          {weddingName(event)}
        </span>

        {(gowns !== null || phone) && (
          <div className="flex flex-col gap-1 pt-1.5 border-t border-[#0F172A]/20">
            {gowns !== null && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium leading-tight">
                <GownIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span>{gownLabel(gowns)}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium leading-tight min-w-0">
                <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span dir="ltr" className="truncate tabular-nums">
                  {formatPhone(phone)}
                </span>
              </div>
            )}
          </div>
        )}

        <span
          className={`self-start inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${
            isToday
              ? 'bg-[#0F172A] text-[#D4AF37]'
              : isPast
                ? 'bg-[#0F172A]/5 text-[#0F172A]/60'
                : 'bg-[#0F172A]/10 text-[#0F172A]'
          }`}
        >
          <Clock className="w-2.5 h-2.5 shrink-0" />
          {countdown}
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

  // Weddings don't need a Day view, only Month and Week (same order as Appointments)
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

  // Weddings month view: days with more than MAX_WEDDINGS_PER_DAY weddings become one summary pill.
  // Weddings week view: days with more than MAX_WEDDING_CARDS_PER_DAY show the first cards plus "+N more".
  const displayEvents = useMemo(() => {
    const isMonth = currentView === Views.MONTH;
    const isWeek = currentView === Views.WEEK;
    if (!isWeddingView || (!isMonth && !isWeek)) return events;

    const byDay = new Map<string, any[]>();
    for (const e of events) {
      const key = format(new Date(e.start), 'yyyy-MM-dd');
      byDay.set(key, [...(byDay.get(key) || []), e]);
    }

    const result: any[] = [];
    byDay.forEach((dayEvents, key) => {
      if (isMonth) {
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
        return;
      }

      // Week view
      if (dayEvents.length <= MAX_WEDDING_CARDS_PER_DAY) {
        result.push(...dayEvents);
        return;
      }
      result.push(...dayEvents.slice(0, MAX_WEDDING_CARDS_PER_DAY));
      result.push({
        id: `wedding-more-${key}`,
        title: `+${dayEvents.length - MAX_WEDDING_CARDS_PER_DAY} more`,
        start: dayEvents[0].start,
        end: dayEvents[0].end,
        allDay: true,
        className: ['wedding-event-large'],
        resource: {
          type: 'wedding-group',
          weddings: dayEvents,
          extra: dayEvents.length - MAX_WEDDING_CARDS_PER_DAY,
        },
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
      week: { event: WeekEvent },
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
    <div className={`h-full min-h-0 bg-white flex flex-col font-sans w-full ${isWeddingView ? 'wedding-mode' : 'appt-mode'}`}>
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
        /* Appointments don't use the all-day row, so keep it hidden */
        .appt-mode .rbc-allday-cell { display: none !important; }
        /* Weddings week view: weddings are all-day items shown as cards.
           Show the all-day row, hide the empty hour grid under it. */
        .wedding-mode .rbc-time-content { display: none !important; }
        .wedding-mode .rbc-time-header-gutter { display: none !important; }
        .wedding-mode .rbc-time-header {
          flex: 1 1 0 !important;
          min-height: 0 !important;
          overflow-y: auto;
        }
        .wedding-mode .rbc-time-header-content .rbc-allday-cell {
          flex: 1 1 auto;
          height: auto !important;
          min-height: 220px;
        }
        .wedding-mode .rbc-time-header-content .rbc-event {
          margin-bottom: 4px !important;
        }
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
            draggableAccessor={(e: any) =>
              e?.resource?.type !== 'wedding-group' && !(isWeddingView && currentView === Views.WEEK)
            }
            resizable
            resizableAccessor={() => !isWeddingView}
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