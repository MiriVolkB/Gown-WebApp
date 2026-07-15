'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/BaseModal';
import type { AppointmentSavePayload, BookingType } from '@/types';

const SERVICE_OPTIONS = [
  'First Appointment',
  'First Fitting',
  'Second Fitting',
  'Pickup',
  'Rental',
];

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
  const [serviceName, setServiceName] = useState(SERVICE_OPTIONS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');

  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    client: false,
    eventTitle: false,
    date: false,
    time: false,
  });

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

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
        setServiceName(SERVICE_OPTIONS[0]);
      } else {
        setEventTitle('');
        setClientName(resource.client?.name || initialData.title || '');
        setClientId(resource.clientId ?? null);
        setClientPhone(resource.clientPhone || resource.client?.phone || '');
        const currentService = resource.service?.name;
        setServiceName(
          SERVICE_OPTIONS.includes(currentService)
            ? currentService
            : SERVICE_OPTIONS[0]
        );
      }

      const start = initialData.start ? new Date(initialData.start) : null;

      if (start && !isNaN(start.getTime())) {
        setDate(format(start, 'yyyy-MM-dd'));
        setTime(format(start, 'HH:mm'));
      } else {
        setDate('');
        setTime('');
      }

      setNotes(resource.notes || '');

      const end = initialData.end ? new Date(initialData.end) : null;
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = (end.getTime() - start.getTime()) / 60000;
        setDuration(diff.toString());
      } else {
        setDuration('30');
      }
    } else {
      setBookingType('client');
      setClientName('');
      setClientId(null);
      setClientPhone('');
      setEventTitle('');
      setServiceName(SERVICE_OPTIONS[0]);

      if (selectedDate && !isNaN(selectedDate.getTime())) {
        setDate(format(selectedDate, 'yyyy-MM-dd'));
      } else {
        setDate('');
      }

      if (selectedTime) setTime(selectedTime);
      setDuration('30');
      setNotes('');
    }
  }, [isOpen, selectedDate, selectedTime, initialData]);

  const handleBookingTypeChange = (type: BookingType) => {
    setBookingType(type);
    setFieldErrors({ client: false, eventTitle: false, date: false, time: false });
    setErrorMessage('');
    if (type === 'custom') {
      setClientName('');
      setClientId(null);
      setClientPhone('');
      setShowClientList(false);
    } else {
      setEventTitle('');
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

    setErrorMessage('');
    setFieldErrors({
      client: false,
      eventTitle: false,
      date: false,
      time: false,
    });
    setIsSubmitting(true);

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(
      startDateTime.getTime() + parseInt(duration) * 60000
    );

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
    <BaseModal title={modalTitle} onClose={onClose}>
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
          {/* Booking Type Toggle */}
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
              {/* Client Search */}
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

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white appearance-none focus:ring-2 focus:ring-slate-900"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  >
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
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

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
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
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                className={`w-full px-3 py-2 border rounded-lg outline-none ${
                  fieldErrors.time
                    ? 'border-red-500 focus:ring-red-500 bg-red-50 text-red-900'
                    : 'border-gray-300 focus:ring-slate-900'
                }`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-slate-900"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="90">1.5 Hours</option>
              <option value="120">2 Hours</option>
            </select>
          </div>

          {/* Notes */}
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

          {/* Action Buttons */}
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
