'use client';

import React, { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, Plus, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components from both branches
import AppointmentDetails from '@/components/AppointmentDetails';
import AppointmentModal from '@/components/AppointmentModal';
import { ClientsPage } from '@/components/ClientsPage';
import { ClientProfilePage } from '@/components/ClientProfilePage';

// Types
import { Client, Appointment } from '@/types';

// Keeping these consistent for visual continuity
const SERVICE_COLORS: Record<string, string> = {
  'First Appointment': '#3b82f6', // Blue
  'First Fitting': '#f59e0b',     // Orange
  'Second Fitting': '#8b5cf6',    // Purple
  'Pickup': '#10b981',            // Green
  'Rental': '#ec4899',            // Pink
};

// Logic Components (Headers/Dialogs - Update these to your real component paths)
const Header = (props: any) => null; 
const NewClientDialog = (props: any) => null;

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  // --- DATA FETCHING (Using React Query from Feature branch) ---
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  });

  const { data: appointments = [], isLoading: loading, refetch } = useQuery<any[]>({
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

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === Number(selectedClientId))
    : undefined;

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen font-sans flex flex-col">
      
      {/* 1. DASHBOARD VIEW (HEAD Design) */}
      {currentPage === 'home' && (
        <>
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
                  onClick={() => setCurrentPage('clients')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ffffff15] text-white rounded-full hover:bg-[#ffffff25] transition-all font-medium text-sm backdrop-blur-md border border-[#ffffff20] shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Clients List
                </button>
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#0F172A] rounded-full hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all font-bold text-sm shadow"
                >
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-10 md:px-10 -mt-8 z-10">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-12 text-center mt-6 border border-gray-100">
                  <p className="text-gray-400 animate-pulse text-lg font-light">Loading schedule...</p>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-16 text-center border border-dashed border-gray-300 mt-6">
                  <h3 className="text-xl font-bold text-gray-700">No appointments today</h3>
                  <button onClick={() => setIsCreateOpen(true)} className="text-blue-600 font-medium hover:underline mt-4">
                    Add an appointment manually
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-gray-800 px-2 mb-6">Today's Appointments</h2>
                  {todaysAppointments.map((appt) => {
                    const serviceColor = SERVICE_COLORS[appt.service?.name] || '#0F172A';
                    return (
                      <div 
                        key={appt.id} 
                        onClick={() => setSelectedEvent(appt)}
                        className="group bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all cursor-pointer flex items-stretch"
                      >
                        <div className="w-2" style={{ backgroundColor: serviceColor }}></div>
                        <div className="w-48 p-4 border-r border-gray-50 flex items-center justify-center font-bold text-gray-700">
                          {format(appt.start, 'h:mm')} - {format(appt.end, 'h:mm a')}
                        </div>
                        <div className="flex-1 p-5">
                          <h3 className="text-xl font-bold text-gray-900">{appt.client?.name}</h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: serviceColor }}>
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

      {/* 2. CLIENTS LIST VIEW (Feature Logic) */}
      {currentPage === 'clients' && (
        <main className="p-10">
          <ClientsPage
            clients={clients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClientClick={(id) => {
              setSelectedClientId(id.toString());
              setCurrentPage('client-profile');
            }}
            onNewClient={() => {}} 
          />
        </main>
      )}

      {/* 3. CLIENT PROFILE VIEW (Feature Logic) */}
      {currentPage === 'client-profile' && selectedClient && (
        <main className="p-10">
          <ClientProfilePage
            client={selectedClient}
            appointments={appointments.filter(a => a.clientId === selectedClient.id)}
            onBack={() => setCurrentPage('clients')}
            onNewAppointment={() => setIsCreateOpen(true)}
          />
        </main>
      )}

      {/* SHARED MODALS */}
      <AppointmentDetails 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDelete}
        onEdit={() => {}}
      />

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