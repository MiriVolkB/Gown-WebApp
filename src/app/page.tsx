'use client';

import React, { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, Plus, UserPlus } from 'lucide-react';
import AppointmentDetails from '@/components/AppointmentDetails';
import AppointmentModal from '@/components/AppointmentModal';

// Keeping these consistent with the calendar for visual continuity
const SERVICE_COLORS: Record<string, string> = {
  'First Appointment': '#3b82f6', // Blue
  'First Fitting': '#f59e0b',     // Orange
  'Second Fitting': '#8b5cf6',    // Purple
  'Pickup': '#10b981',            // Green
  'Rental': '#ec4899',            // Pink
};

export default function HomePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchAppointments = () => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const today = new Date();
          const todaysAppointments = data
            .map((appt: any) => ({
                ...appt,
                start: new Date(appt.start),
                end: new Date(appt.end),
                title: appt.client?.name || 'Unknown',
                resource: { ...appt }
            }))
            .filter((appt: any) => isSameDay(appt.start, today))
            .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

          setAppointments(todaysAppointments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id: number) => {
      await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedEvent(null);
  };

  const handleSave = async (data: any) => {
    const res = await fetch('/api/appointments', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        setIsCreateOpen(false);
        fetchAppointments();
    }
  };

  return (
    // Changed background to a slightly warmer off-white for a premium feel
    <div className="flex-1 bg-[#F9FAFB] min-h-screen font-sans flex flex-col">
      
      {/* HEADER - Premium Gradient Navy */}
      <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] px-10 py-14 shadow-lg text-white border-b border-[#ffffff10]"> 
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
                <h1 className="text-[3.5rem] font-extralight tracking-tight leading-tight">
                    Welcome, <span className="font-bold">Rachelli</span>
                </h1>
                <div className="flex items-center gap-2 text-blue-100/80 text-lg mt-2 font-light">
                    <Calendar className="w-5 h-5 opacity-70" />
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </div>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => alert("New Client Page Coming Soon!")}
                    className="flex items-center gap-2 px-6 py-3 bg-[#ffffff15] text-white rounded-full hover:bg-[#ffffff25] transition-all font-medium text-sm backdrop-blur-md border border-[#ffffff20] shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    New Client
                </button>

                <button 
                    onClick={() => setIsCreateOpen(true)}
                    // Updated button color to match the deep navy, with a subtle gradient hover
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#0F172A] rounded-full hover:bg-gradient-to-r hover:from-white hover:to-blue-50 hover:shadow-md hover:-translate-y-0.5 transition-all font-bold text-sm shadow"
                >
                    <Plus className="w-4 h-4" />
                    Book Appointment
                </button>
            </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 px-6 py-10 md:px-10 -mt-8 z-10">
        <div className="max-w-6xl mx-auto">
            
            {loading ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-12 shadow-sm text-center mt-6 border border-gray-100">
                    <p className="text-gray-400 animate-pulse text-lg font-light">Loading your schedule...</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-16 shadow-sm text-center border border-dashed border-gray-300 mt-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">No appointments today</h3>
                    <p className="text-gray-500 mb-8 mt-2 font-light">Your schedule is completely clear.</p>
                    <button onClick={() => setIsCreateOpen(true)} className="text-blue-600 font-medium hover:underline text-lg">
                        Add an appointment manually
                    </button>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Header for list */}
                    <div className="flex items-center justify-between px-2 mb-6 mt-2">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Today's Appointments</h2>
                        <span className="text-sm font-medium text-gray-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                            {appointments.length} Total
                        </span>
                    </div>

                    {appointments.map((appt) => {
                        const startTime = format(appt.start, 'h:mm');
                        const endTime = format(appt.end, 'h:mm a');
                        const timeString = `${startTime} - ${endTime}`;
                        
                        const serviceName = appt.service?.name;
                        const serviceColor = SERVICE_COLORS[serviceName] || appt.service?.color || '#0F172A';

                        return (
                            <div 
                                key={appt.id} 
                                onClick={() => setSelectedEvent(appt)}
                                className="group relative bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-stretch">
                                    {/* Color Strip - slightly thinner and cleaner */}
                                    <div className="w-2" style={{ backgroundColor: serviceColor }}></div>

                                    {/* Time Section - Cleaner background */}
                                    <div className="w-48 p-4 border-r border-gray-50 flex items-center justify-center flex-shrink-0 bg-white">
                                        <span className="text-lg font-bold text-gray-700 tracking-tight">
                                            {timeString}
                                        </span>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0F172A] transition-colors truncate">
                                                {appt.client?.name}
                                            </h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                                                style={{ backgroundColor: serviceColor }}
                                            >
                                                {appt.service?.name}
                                            </span>
                                            {appt.notes && (
                                                <span className="text-sm text-gray-400 truncate flex-1 font-light">
                                                    {appt.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Arrow - Subtle */}
                                    <div className="w-16 flex items-center justify-center text-gray-200 group-hover:text-blue-600/70 transition-all duration-300 bg-white translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      {/* REUSED COMPONENTS */}
      <AppointmentDetails 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDelete}
        onEdit={() => alert("Please edit via Calendar page for full options")}
      />

      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-[#0F172A]/20 transition-all">
            <div className="absolute inset-0" onClick={() => setIsCreateOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-gray-100">
                <AppointmentModal 
                    isOpen={true} 
                    onClose={() => setIsCreateOpen(false)}
                    selectedDate={new Date()}
                    selectedTime="09:00"
                    onSave={handleSave} 
                />
            </div>
        </div>
      )}
    </div>
  );
}