'use client';

import React, { useState, useEffect } from 'react';
import CalendarView from '../../components/MyCalendar';
import AppointmentModal from '../../components/AppointmentModal';
import AppointmentDetails from '../../components/AppointmentDetails';
import '../globals.css'; // Make sure the path is correct based on where your file is!

// NEW: Static list of your service colors for the legend
const APPOINTMENT_LEGEND = [
  { label: 'First Appt', color: '#3b82f6' },
  { label: 'First Fitting', color: '#f59e0b' },
  { label: 'Second Fitting', color: '#8b5cf6' },
  { label: 'Pickup', color: '#10b981' },
  { label: 'Rental', color: '#ec4899' },
  { label: 'Other', color: '#64748b' },
];

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // State for our two different types of events
  const [appointments, setAppointments] = useState<any[]>([]);
  const [weddingEvents, setWeddingEvents] = useState<any[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editingData, setEditingData] = useState<any | null>(null);

  // Toggle state
  const [showWeddingsOnly, setShowWeddingsOnly] = useState(false);

  // 1. Load Appointments
  const fetchAppointments = () => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const formattedEvents = data.map((appt: any) => ({
            id: appt.id,
            title: appt.title || appt.client?.name || 'Untitled',
            start: new Date(appt.start),
            end: new Date(appt.end),
            resource: { ...appt, type: 'appointment' }
        }));
        setAppointments(formattedEvents);
      })
      .catch(err => console.error("Error fetching appointments:", err));
  };

  // 2. Load Clients & extract Wedding Dates
  const fetchWeddings = () => {
    fetch('/api/clients') 
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        
        const formattedWeddings = data
          .filter((client: any) => client.WeddingDate)
          .map((client: any) => {
            const date = new Date(client.WeddingDate);
            return {
              id: `wedding-${client.id}`,
              title: `💍 ${client.name}'s Wedding`,
              start: date,
              end: date, 
              allDay: true, 
              // NEW: Add a custom class name so we can target it with CSS
              className: ['wedding-event-large'],
              resource: { ...client, type: 'wedding' }
            };
          });
        setWeddingEvents(formattedWeddings);
      })
      .catch(err => console.error("Error fetching weddings:", err));
  };

  useEffect(() => {
    fetchAppointments();
    fetchWeddings();
  }, []);

  // --- Handle Drag & Drop API Save ---
  const handleEventUpdate = async ({ event, start, end }: any) => {
    // Prevent dragging wedding dates if they shouldn't be movable from the calendar
    if (event.resource.type === 'wedding') {
        alert("Wedding dates must be updated on the Client's profile.");
        return;
    }

    const updatedEvents = appointments.map((evt) => 
      evt.id === event.id ? { ...evt, start, end } : evt
    );
    setAppointments(updatedEvents);

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: event.id,
                start: start,
                end: end,
                bookingType: event.resource.clientId == null ? 'custom' : 'client',
                clientId: event.resource.clientId,
                eventTitle: event.resource.title,
                serviceId: event.resource.serviceId,
                serviceName: event.resource.service?.name,
                notes: event.resource.notes
            }),
        });

        if (!res.ok) {
            alert("Failed to move appointment");
            fetchAppointments(); 
        }
    } catch (error) {
        console.error("Move failed", error);
        fetchAppointments(); 
    }
  };

  const handleSlotClick = (slotInfo: { start: Date }) => {
    // Optional: Prevent creating appointments while in wedding view
    if (showWeddingsOnly) return;

    const date = slotInfo.start;
    setSelectedDate(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
    
    setEditingData(null);
    setSelectedEvent(null);
    setIsModalOpen(true);            
  };

  const handleEventClick = (event: any) => {
      setSelectedEvent(event);
      setIsModalOpen(false); 
  };

  const handleEditAppointment = (event: any) => {
      setEditingData(event);
      setSelectedEvent(null);
      setIsModalOpen(true);   
  };

  const handleDeleteAppointment = async (id: number) => {
      await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedEvent(null);
  };

  const handleSaveAppointment = async (data: any) => {
    const res = await fetch('/api/appointments', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        setIsModalOpen(false);
        fetchAppointments(); 
    } else {
        alert("Failed to save.");
    }
  };

  // 3. Determine which list of events to pass to the calendar
  const displayedEvents = showWeddingsOnly ? weddingEvents : appointments;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] -mx-4 -mt-4 -mb-4 md:mx-0 md:mt-0 md:mb-0 md:h-[calc(100dvh-4rem-4rem)] bg-slate-50 relative overflow-hidden">
      
      {/* Header with title, legend, and toggle */}
      <div className="px-4 py-3 md:px-8 md:py-6 bg-white border-b border-slate-200 flex flex-col gap-3 md:gap-4 shrink-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1
              className="text-4xl font-light tracking-wide"
              style={{ color: '#1E2024', fontFamily: "'Playfair Display', serif" }}
            >
              Calendar
            </h1>
            
            {/* Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 w-full sm:w-auto">
              <button
                onClick={() => setShowWeddingsOnly(false)}
                className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-md font-medium text-xs md:text-sm transition-all duration-200 ${
                  !showWeddingsOnly 
                    ? 'bg-[#0F172A] text-white shadow-sm hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-200/50'
                }`}
              >
                Appointments
              </button>
              
              <button
                onClick={() => setShowWeddingsOnly(true)}
                className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-md font-medium text-xs md:text-sm transition-all duration-200 ${
                  showWeddingsOnly 
                    ? 'bg-[#0F172A] text-white shadow-sm hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-200/50'
                }`}
              >
                Weddings
              </button>
            </div>
          </div>

          {/* Mobile legend - horizontal scroll */}
          {!showWeddingsOnly && (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 lg:hidden calendar-scroll">
              {APPOINTMENT_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Desktop legend */}
          {!showWeddingsOnly && (
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full shadow-sm w-fit">
              {APPOINTMENT_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-2 md:p-4">
        <div className="h-full bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CalendarView 
            events={displayedEvents} 
            onSlotClick={handleSlotClick} 
            onEventClick={handleEventClick}
            setEvents={showWeddingsOnly ? setWeddingEvents : setAppointments} 
            onEventUpdate={handleEventUpdate} 
          />
        </div>
      </div>

      <AppointmentDetails 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={selectedEvent?.resource?.type === 'appointment' ? handleDeleteAppointment : undefined}
        onEdit={selectedEvent?.resource?.type === 'appointment' ? handleEditAppointment : undefined}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 sm:bg-black/20" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 w-full sm:max-w-md z-10 max-h-[92dvh] overflow-y-auto">
                <AppointmentModal 
                    isOpen={true} 
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSave={handleSaveAppointment} 
                    initialData={editingData} 
                />
            </div>
        </div>
      )}
    </div>
  );
}