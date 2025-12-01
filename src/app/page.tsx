// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientsPage } from '@/components/ClientsPage';
import { ClientProfilePage } from '@/components/ClientProfilePage';
import { Client, Appointment } from '@/types';

// TEMP FIX: Define dummy components until you create the real ones
const Header = (props: any) => null;
const Sidebar = (props: any) => null;
const HomePage = (props: any) => null;
const CalendarPage = (props: any) => null;
const NewClientDialog = (props: any) => null;
const NewAppointmentDialog = (props: any) => null;
const AppointmentDetailsDrawer = (props: any) => null;

// TEMP FIX: Dummy toast and Toaster
const toast = { success: console.log, error: console.log };
const Toaster = () => null;

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [newAppointmentDialogOpen, setNewAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    }
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: Omit<Client, "id" | "appointments" | "measurements" | "createdAt">) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (!res.ok) throw new Error('Failed to add client');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully');
    },
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!res.ok) throw new Error('Failed to add appointment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked successfully');
    },
  });

  const todaysAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().slice(0, 10)
  );

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === Number(selectedClientId))
    : undefined;

  const appointmentClient = selectedAppointment
    ? clients.find((c) => c.id === selectedAppointment.clientId)
    : undefined;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewClient={() => setNewClientDialogOpen(true)}
        onNewAppointment={() => setNewAppointmentDialogOpen(true)}
        onSearch={() => {}}
      />

      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="ml-64 mt-24 min-h-[calc(100vh-6rem)]">
        {currentPage === 'clients' && (
          <ClientsPage
            clients={clients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClientClick={(id) => {
              setSelectedClientId(id);
              setCurrentPage('client-profile');
            }}
            onNewClient={() => setNewClientDialogOpen(true)}
          />
        )}
        {currentPage === 'client-profile' && selectedClient && (
          <ClientProfilePage
            client={selectedClient}
            appointments={(appointments || []).filter(a => a.clientId === selectedClient.id)}
            onBack={() => {
              setSelectedClientId(null);
              setCurrentPage('clients');
            }}
            onNewAppointment={() => setNewAppointmentDialogOpen(true)}
          />
        )}
      </main>

      <NewClientDialog 
        open={newClientDialogOpen} 
        onOpenChange={setNewClientDialogOpen} 
        onSave={(clientData: Omit<Client, "id" | "appointments" | "measurements" | "createdAt">) => {
          addClientMutation.mutate(clientData);
          setNewClientDialogOpen(false);
        }} 
      />
      <NewAppointmentDialog 
        open={newAppointmentDialogOpen} 
        onOpenChange={setNewAppointmentDialogOpen} 
        onSave={(appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
          addAppointmentMutation.mutate(appointmentData);
          setNewAppointmentDialogOpen(false);
        }} 
        clients={clients} 
      />
      <AppointmentDetailsDrawer open={appointmentDrawerOpen} onOpenChange={setAppointmentDrawerOpen} appointment={selectedAppointment} client={appointmentClient} onCancel={() => {}} />

      <Toaster />
    </div>
  );
}
