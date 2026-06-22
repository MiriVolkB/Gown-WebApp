'use client';

import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, Plus, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Components from both branches
import AppointmentDetails from '@/components/AppointmentDetails';
import AppointmentModal from '@/components/AppointmentModal';
import { ClientsPage } from '@/components/ClientsPage';
import { Button } from '@/components/ui/button'; // Adjust the path to wherever this file lives

// Types
import {
  ClientListItem,
  AppointmentWithService,
} from '@/types';

// Keeping these consistent for visual continuity
const SERVICE_COLORS: Record<string, string> = {
  'First Appointment': '#3b82f6', // Blue
  'First Fitting': '#f59e0b',     // Orange
  'Second Fitting': '#8b5cf6',    // Purple
  'Pickup': '#10b981',            // Green
  'Rental': '#ec4899',            // Pink
};

export default function HomePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const { data: clients = [] } = useQuery<ClientListItem[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  });

  const { data: appointments = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      return Array.isArray(data) ? data.map(appt => ({
        ...appt,
        start: new Date(appt.start),
        end: new Date(appt.end),
        title: appt.client?.name || 'Unknown',
      })) : [];
    }
  });

  const todaysAppointments = appointments
    .filter((appt) => isSameDay(new Date(appt.start), new Date()))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // --- MUTATIONS ---
  const addAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsCreateOpen(false);
    },
  });

  const handleDelete = async (id: number) => {
    await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    setSelectedEvent(null);
  };

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen font-sans flex flex-col">

      {/* 1. DASHBOARD VIEW */}
      {currentPage === 'home' && (
        <>
          {/* RESPONSIVE & NARROW HEADER */}
          <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] px-4 sm:px-6 md:px-10 py-6 md:py-8 shadow-lg text-white border-b border-[#ffffff10]">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5 flex-wrap overflow-hidden">
              {/* Welcome Text */}
              <div>
                <h1 className="text-3xl md:text-4xl font-extralight tracking-tight leading-tight">
                  Welcome, <span className="font-bold">Rachelli</span>
                </h1>
                <div className="flex items-center gap-2 text-blue-100/80 text-sm md:text-base mt-1.5 font-light">
                  <Calendar className="w-4 h-4 opacity-70" />
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </div>
              </div>

              {/* Action Buttons (Stacked on mobile, row on tablet/desktop) */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
                <Button
                  variant="dashboardSecondary"
                  onClick={() => setCurrentPage('clients')}
                  className="flex justify-center items-center gap-2 px-5 py-2.5 bg-[#ffffff15] text-white rounded-full hover:bg-[#ffffff25] transition-all font-medium text-sm backdrop-blur-md border border-[#ffffff20] shadow-sm w-full sm:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Clients List
                </Button>
                <Button
                  variant="dashboardPrimary"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex justify-center items-center gap-2 px-5 py-2.5 bg-white text-[#0F172A] rounded-full hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all font-bold text-sm shadow w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </Button>
              </div>

            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 z-10">
            <div className="max-w-6xl mx-auto">

              {loading ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-8 md:p-12 text-center border border-gray-100">
                  <p className="text-gray-400 animate-pulse text-lg font-light">Loading schedule...</p>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-10 md:p-16 text-center border border-dashed border-gray-300">
                  <h3 className="text-xl font-bold text-gray-700">No appointments today</h3>
                  <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-blue-600 font-medium hover:underline mt-4">
                    Add an appointment manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 px-1 mb-4 md:mb-6">Today's Appointments</h2>

                  {todaysAppointments.map((appt) => {
                    const serviceColor = SERVICE_COLORS[appt.service?.name] || '#0F172A';
                    return (
                      <div
                        key={appt.id}
                        onClick={() => setSelectedEvent(appt)}
                        className="group bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-stretch"
                      >
                        {/* Desktop Side Color Strip */}
                        <div className="hidden md:block w-2" style={{ backgroundColor: serviceColor }}></div>
                        {/* Mobile Top Color Strip */}
                        <div className="md:hidden h-2 w-full" style={{ backgroundColor: serviceColor }}></div>

                        {/* Time Container */}
                        <div className="w-full md:w-48 p-3 md:p-4 border-b md:border-b-0 md:border-r border-gray-50 flex items-center justify-center md:justify-start font-bold text-gray-700 bg-gray-50/40 md:bg-transparent text-sm md:text-base">
                          {format(appt.start, 'h:mm')} - {format(appt.end, 'h:mm a')}
                        </div>

                        {/* Client Details Container */}
                        <div className="flex-1 p-4 md:p-5 flex flex-col justify-center items-start">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1.5 md:mb-1">{appt.client?.name || 'Unknown Client'}</h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full text-white tracking-wide" style={{ backgroundColor: serviceColor }}>
                            {appt.service?.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 2. CLIENTS LIST VIEW */}
      {currentPage === 'clients' && (
        <main className="p-4 sm:p-6 md:p-10">
          <ClientsPage
            clients={clients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClientClick={(id) => {
              router.push(`/clients/${id}`);
            }}
            onNewClient={() => {
              router.push('/clients/new');
            }}
          />
        </main>
      )}

      {/* SHARED MODALS */}
      {selectedEvent && (
        <AppointmentDetails
          isOpen={!!selectedEvent}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDelete}
          onEdit={() => { /* Handle edit if needed */ }}
        />
      )}

      <AppointmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        selectedDate={new Date()}
        selectedTime="09:00"
        onSave={(data) => addAppointmentMutation.mutate(data)}
      />
    </div>
  );
}