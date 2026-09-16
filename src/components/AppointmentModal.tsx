'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isSameDay, parseISO, startOfDay, addMinutes } from 'date-fns';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/BaseModal';
import type { AppointmentSavePayload, BookingType } from '@/types';

const FALLBACK_SERVICES = [
  'First Appointment',
  'First Fitting',
  'Second Fitting',
  'Pickup',
  'Rental',
];

/** Quick-pick durations shown as hours (0.25 = 15 min) */
const DURATION_QUICK_PICKS = [
  { hours: 0.25, label: '15m' },
  { hours: 0.5, label: '30m' },
  { hours: 0.75, label: '45m' },
  { hours: 1, label: '1h' },
  { hours: 1.5, label: '1.5h' },
  { hours: 2, label: '2h' },
  { hours: 3, label: '3h' },
  { hours: 4, label: '4h' },
  { hours: 6, label: '6h' },
  { hours: 8, label: '8h' },
  { hours: 12, label: '12h' },
  { hours: 24, label: 'All day' },
];

const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 21; // last start hour inclusive
const SLOT_STEP_MINUTES = 30;

type ServiceOption = {
  id: number;
  name: string;
  defaultDurationMin: number;
  active: boolean;
};

type DayAppointment = {
  id: number;
  start: Date;
  end: Date;
  label: string;
};

type TimeSlot = {
  time: string; // HH:mm
  minutesFromMidnight: number;
};

function minutesToHoursString(minutes: number): string {
  const hours = minutes / 60;
  const rounded = Math.round(hours * 100) / 100;
  return String(rounded);
}

function hoursStringToMinutes(hoursStr: string): number {
  const hours = parseFloat(hoursStr);
  if (Number.isNaN(hours) || hours <= 0) return 30;
  return Math.min(1440, Math.max(1, Math.round(hours * 60)));
}

function buildDaySlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = SLOT_START_HOUR; hour <= SLOT_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      if (hour === SLOT_END_HOUR && minute > 0) break;
      slots.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        minutesFromMidnight: hour * 60 + minute,
      });
    }
  }
  return slots;
}

const DAY_SLOTS = buildDaySlots();

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart;
}

function formatSlotLabel(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, '0')}`;
}

/** Snap HH:mm to nearest available grid slot */
function snapToSlot(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const total = h * 60 + m;
  let best = DAY_SLOTS[0];
  let bestDiff = Math.abs(best.minutesFromMidnight - total);
  for (const slot of DAY_SLOTS) {
    const diff = Math.abs(slot.minutesFromMidnight - total);
    if (diff < bestDiff) {
      best = slot;
      bestDiff = diff;
    }
  }
  return best.time;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSave: (data: AppointmentSavePayload) => void | Promise<void>;
  initialData?: any;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onSave,
  initialData,
}: AppointmentModalProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType>('client');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [services, setServices] = useState<ServiceOption[]>([]);
  const serviceNames = useMemo(
    () =>
      services.length
        ? services.filter((s) => s.active).map((s) => s.name)
        : FALLBACK_SERVICES,
    [services]
  );
  const [serviceName, setServiceName] = useState(FALLBACK_SERVICES[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationHours, setDurationHours] = useState('0.5');
  const [notes, setNotes] = useState('');

  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [showClientList, setShowClientList] = useState(false);
  const [dayAppointments, setDayAppointments] = useState<DayAppointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    client: false,
    eventTitle: false,
    date: false,
    time: false,
  });

  const editingId = initialData?.id ?? null;
  const durationMinutes = hoursStringToMinutes(durationHours);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch((err) => console.error(err));

    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const names = services.length
      ? services.filter((s) => s.active).map((s) => s.name)
      : FALLBACK_SERVICES;
    const defaultService = names[0] || FALLBACK_SERVICES[0];

    if (initialData) {
      const resource = initialData.resource || initialData;
      const isCustom =
        resource.clientId == null &&
        Boolean(resource.title || (initialData.title && !resource.client));

      setBookingType(isCustom ? 'custom' : 'client');

      if (isCustom) {
        setEventTitle(resource.title || initialData.title || '');
        setClientName('');
        setClientId(null);
        setClientPhone('');
        setServiceName(defaultService);
      } else {
        setEventTitle('');
        setClientName(resource.client?.name || initialData.title || '');
        setClientId(resource.clientId ?? null);
        setClientPhone(resource.clientPhone || resource.client?.phone || '');
        const currentService = resource.service?.name;
        setServiceName(
          currentService &&
            (names.includes(currentService) ||
              services.some((s) => s.name === currentService))
            ? currentService
            : defaultService
        );
      }

      const start = initialData.start ? new Date(initialData.start) : null;

      if (start && !isNaN(start.getTime())) {
        setDate(format(start, 'yyyy-MM-dd'));
        setTime(snapToSlot(format(start, 'HH:mm')));
      } else {
        setDate('');
        setTime('');
      }

      setNotes(resource.notes || '');

      const end = initialData.end ? new Date(initialData.end) : null;
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = (end.getTime() - start.getTime()) / 60000;
        setDurationHours(minutesToHoursString(diff));
      } else if (isCustom) {
        setDurationHours('2');
      } else {
        setDurationHours('0.5');
      }
    } else {
      setBookingType('client');
      setClientName('');
      setClientId(null);
      setClientPhone('');
      setEventTitle('');
      setServiceName(defaultService);

      if (selectedDate && !isNaN(selectedDate.getTime())) {
        setDate(format(selectedDate, 'yyyy-MM-dd'));
      } else {
        setDate('');
      }

      if (selectedTime) setTime(snapToSlot(selectedTime));
      else setTime('');
      const matched = services.find((s) => s.name === defaultService);
      setDurationHours(minutesToHoursString(matched?.defaultDurationMin || 30));
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-init when modal opens / slot changes
  }, [isOpen, selectedDate, selectedTime, initialData]);

  // Load appointments for the selected day (escape-room availability)
  useEffect(() => {
    if (!isOpen || !date) {
      setDayAppointments([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);

    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const day = parseISO(date);
        const appts: DayAppointment[] = data
          .filter((appt: any) => {
            if (!appt?.start || !appt?.end) return false;
            if (editingId && appt.id === editingId) return false;
            return isSameDay(new Date(appt.start), day);
          })
          .map((appt: any) => ({
            id: appt.id,
            start: new Date(appt.start),
            end: new Date(appt.end),
            label:
              appt.title ||
              appt.client?.name ||
              appt.service?.name ||
              'Booked',
          }));
        setDayAppointments(appts);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, date, editingId]);

  const busyIntervals = useMemo(() => {
    if (!date) return [];
    const dayStart = startOfDay(parseISO(date)).getTime();
    return dayAppointments.map((appt) => ({
      startMin: (appt.start.getTime() - dayStart) / 60000,
      endMin: (appt.end.getTime() - dayStart) / 60000,
      label: appt.label,
    }));
  }, [dayAppointments, date]);

  const slotStates = useMemo(() => {
    return DAY_SLOTS.map((slot) => {
      const slotStart = slot.minutesFromMidnight;
      const slotEnd = slotStart + SLOT_STEP_MINUTES;

      const covering = busyIntervals.find((b) =>
        rangesOverlap(slotStart, slotEnd, b.startMin, b.endMin)
      );
      const taken = Boolean(covering);

      const bookingEnd = slotStart + durationMinutes;
      const collidesWithDuration =
        !taken &&
        busyIntervals.some((b) =>
          rangesOverlap(slotStart, bookingEnd, b.startMin, b.endMin)
        );

      const startsInSlot = covering
        ? covering.startMin >= slotStart && covering.startMin < slotEnd
        : false;

      return {
        ...slot,
        taken,
        blocked: collidesWithDuration,
        bookingLabel: startsInSlot ? covering?.label : undefined,
      };
    });
  }, [busyIntervals, durationMinutes]);

  const selectedRange = useMemo(() => {
    if (!time) return null;
    const match = DAY_SLOTS.find((s) => s.time === time);
    if (!match) return null;
    return {
      start: match.minutesFromMidnight,
      end: match.minutesFromMidnight + durationMinutes,
    };
  }, [time, durationMinutes]);

  // Clear selection if duration change makes current start invalid
  useEffect(() => {
    if (!time || !date) return;
    const slot = slotStates.find((s) => s.time === time);
    if (slot && (slot.taken || slot.blocked)) {
      setTime('');
    }
  }, [durationMinutes, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookingTypeChange = (type: BookingType) => {
    setBookingType(type);
    setFieldErrors({ client: false, eventTitle: false, date: false, time: false });
    setErrorMessage('');
    if (type === 'custom') {
      setClientName('');
      setClientId(null);
      setClientPhone('');
      setShowClientList(false);
      setDurationHours('2');
    } else {
      setEventTitle('');
      const matched = services.find((s) => s.name === serviceName);
      setDurationHours(minutesToHoursString(matched?.defaultDurationMin || 30));
    }
  };

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientName(term);
    setClientId(null);
    if (term.length > 0) {
      const matches = clients.filter((c) =>
        c.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredClients(matches);
      setShowClientList(true);
    } else {
      setShowClientList(false);
    }
  };

  const selectClient = (client: any) => {
    setClientName(client.name);
    setClientId(client.id);
    setClientPhone(client.phone || '');
    setShowClientList(false);
  };

  const selectSlot = (slotTime: string, disabled: boolean) => {
    if (disabled) return;
    setTime(slotTime);
    setFieldErrors((prev) => ({ ...prev, time: false }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = {
      client: bookingType === 'client' && !clientName,
      eventTitle: bookingType === 'custom' && !eventTitle.trim(),
      date: !date,
      time: !time,
    };

    setFieldErrors(missingFields);

    if (
      missingFields.client ||
      missingFields.eventTitle ||
      missingFields.date ||
      missingFields.time
    ) {
      setErrorMessage('Please fill in the highlighted fields.');
      setTimeout(() => {
        setErrorMessage('');
        setFieldErrors({
          client: false,
          eventTitle: false,
          date: false,
          time: false,
        });
      }, 4000);
      return;
    }

    const chosen = slotStates.find((s) => s.time === time);
    if (chosen && (chosen.taken || chosen.blocked)) {
      setErrorMessage('That time overlaps an existing booking. Pick another slot.');
      setFieldErrors((prev) => ({ ...prev, time: true }));
      return;
    }

    setErrorMessage('');
    setFieldErrors({
      client: false,
      eventTitle: false,
      date: false,
      time: false,
    });
    setIsSubmitting(true);

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = addMinutes(startDateTime, durationMinutes);

    const payload: AppointmentSavePayload =
      bookingType === 'custom'
        ? {
            id: initialData?.id,
            bookingType: 'custom',
            eventTitle: eventTitle.trim(),
            serviceName: 'Other',
            start: startDateTime,
            end: endDateTime,
            notes,
          }
        : {
            id: initialData?.id,
            bookingType: 'client',
            clientName,
            clientId,
            clientPhone,
            serviceName,
            start: startDateTime,
            end: endDateTime,
            notes,
          };

    try {
      await onSave(payload);

      setShowSuccess(true);

      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setIsSubmitting(false);
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setIsSubmitting(false);
      alert('Failed to save the appointment.');
    }
  };

  const modalTitle = showSuccess
    ? 'Success'
    : initialData?.id
      ? bookingType === 'custom'
        ? 'Edit Custom Event'
        : 'Edit Appointment'
      : bookingType === 'custom'
        ? 'New Custom Event'
        : 'New Appointment';

  return (
    <BaseModal title={modalTitle} onClose={onClose} maxWidth="lg">
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {bookingType === 'custom' ? 'Event Saved!' : 'Appointment Saved!'}
          </h2>
          <p className="text-gray-500 text-sm">The calendar has been updated.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Booking Type
            </label>
            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleBookingTypeChange('client')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  bookingType === 'client'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                Client Appointment
              </button>
              <button
                type="button"
                onClick={() => handleBookingTypeChange('custom')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  bookingType === 'custom'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                Custom Event
              </button>
            </div>
          </div>

          {bookingType === 'client' ? (
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  placeholder="Search or enter new client name..."
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                    fieldErrors.client
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-slate-900 focus:border-slate-900'
                  }`}
                  value={clientName}
                  onChange={handleClientSearch}
                  onFocus={() => clientName && setShowClientList(true)}
                  onBlur={() => setTimeout(() => setShowClientList(false), 200)}
                />
                {showClientList && filteredClients.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0"
                        onClick={() => selectClient(client)}
                      >
                        {client.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {clientName.length > 0 && clientId === null && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-2">
                    New Client Detected
                  </span>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number{' '}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white appearance-none focus:ring-2 focus:ring-slate-900"
                    value={serviceName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setServiceName(name);
                      const matched = services.find((s) => s.name === name);
                      if (matched?.defaultDurationMin) {
                        setDurationHours(
                          minutesToHoursString(matched.defaultDurationMin)
                        );
                      }
                    }}
                  >
                    {serviceNames.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {serviceName && !serviceNames.includes(serviceName) && (
                      <option value={serviceName}>{serviceName}</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                placeholder='e.g. "Travel to TLV to buy fabric"'
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                  fieldErrors.eventTitle
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-slate-900 focus:border-slate-900'
                }`}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-lg outline-none ${
                fieldErrors.date
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 text-red-900'
                  : 'border-gray-300 focus:ring-slate-900'
              }`}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime('');
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                inputMode="decimal"
                placeholder="e.g. 1.5"
                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-slate-900"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                hours
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DURATION_QUICK_PICKS.map((pick) => {
                const isActive =
                  Math.abs(parseFloat(durationHours) - pick.hours) < 0.001;
                return (
                  <button
                    key={pick.hours}
                    type="button"
                    onClick={() => setDurationHours(String(pick.hours))}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {pick.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Escape-room style availability grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Available hours
              </label>
              {time && (
                <span className="text-xs font-medium text-slate-500">
                  Selected {formatSlotLabel(time)}
                  {durationMinutes >= 60
                    ? ` · ${minutesToHoursString(durationMinutes)}h`
                    : ` · ${durationMinutes}m`}
                </span>
              )}
            </div>

            {!date ? (
              <div
                className={`rounded-xl border border-dashed px-4 py-8 text-center text-sm text-slate-400 ${
                  fieldErrors.date ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                Pick a date to see open hours
              </div>
            ) : (
              <div
                className={`rounded-xl border p-3 ${
                  fieldErrors.time
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                {loadingSlots ? (
                  <p className="text-sm text-slate-400 text-center py-6 animate-pulse">
                    Checking schedule...
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slotStates.map((slot) => {
                        const isStart = time === slot.time;
                        const inRange =
                          selectedRange != null &&
                          slot.minutesFromMidnight >= selectedRange.start &&
                          slot.minutesFromMidnight < selectedRange.end;
                        const disabled = slot.taken || slot.blocked;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={disabled}
                            title={
                              slot.taken
                                ? slot.bookingLabel
                                  ? `Taken — ${slot.bookingLabel}`
                                  : 'Taken'
                                : slot.blocked
                                  ? 'Not enough open time for this duration'
                                  : `Book ${slot.time}`
                            }
                            onClick={() => selectSlot(slot.time, disabled)}
                            className={`relative min-h-[2.75rem] rounded-lg border text-xs font-semibold transition-all ${
                              slot.taken
                                ? 'bg-slate-200/90 border-slate-200 text-slate-400 cursor-not-allowed line-through decoration-slate-400/80'
                                : slot.blocked
                                  ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                  : isStart
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                                    : inRange
                                      ? 'bg-slate-700 border-slate-700 text-white'
                                      : 'bg-white border-emerald-200 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="block">{formatSlotLabel(slot.time)}</span>
                            {slot.taken && slot.bookingLabel && (
                              <span className="block text-[9px] font-medium truncate px-1 text-slate-400 no-underline">
                                {slot.bookingLabel}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border border-emerald-200 bg-white" />
                        Open
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-200" />
                        Taken
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-900" />
                        Selected
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-slate-900"
              placeholder="Add details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1E2024] text-white rounded-lg hover:opacity-90 font-medium shadow-sm transition-opacity disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : initialData?.id
                  ? 'Update'
                  : bookingType === 'custom'
                    ? 'Save Event'
                    : 'Save Appointment'}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
}
