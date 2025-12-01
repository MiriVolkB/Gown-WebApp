// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HomePage } from '@/components/HomePage';
import { CalendarPage } from '@/components/CalendarPage';
import { ClientsPage } from '@/components/ClientsPage';
import { ClientProfilePage } from '@/components/ClientProfilePage';
import { NewClientDialog } from '@/components/NewClientDialog';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { AppointmentDetailsDrawer } from '@/components/AppointmentDetailsDrawer';
import { Client, Appointment } from '@/types';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [newAppointmentDialogOpen, setNewAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  // -------------------------------
  // Fetch clients from API
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>(['clients'], async () => {
    const res = await fetch('/api/clients');
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  });

  // Fetch appointments from API
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>(['appointments'], async () => {
    const res = await fetch('/api/appointments');
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  });

  // -------------------------------
  // Mutations
  const addClientMutation = useMutation(
    async (clientData: Omit<Client, 'id' | 'measurements' | 'appointments' | 'createdAt'>) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (!res.ok) throw new Error('Failed to add client');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients']);
        toast.success('Client added successfully');
      },
    }
  );

  const addAppointmentMutation = useMutation(
    async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!res.ok) throw new Error('Failed to add appointment');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments']);
        toast.success('Appointment booked successfully');
      },
    }
  );

  // -------------------------------
  // Handlers
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedClientId(null);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery && currentPage !== 'clients') {
      setCurrentPage('clients');
    }
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentPage('client-profile');
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setCurrentPage('clients');
  };

  const handleSaveClient = (clientData: any) => {
    addClientMutation.mutate(clientData);
    setNewClientDialogOpen(false);
  };

  const handleSaveAppointment = (appointmentData: any) => {
    addAppointmentMutation.mutate(appointmentData);
    setNewAppointmentDialogOpen(false);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDrawerOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to cancel appointment');
      return;
    }
    queryClient.invalidateQueries(['appointments']);
    toast.success('Appointment cancelled');
    setAppointmentDrawerOpen(false);
    setSelectedAppointment(null);
  };

  const todaysAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().slice(0, 10) // today in YYYY-MM-DD
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
        onSearch={handleSearch}
      />
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="ml-64 mt-24 min-h-[calc(100vh-6rem)]">
        {currentPage === 'home' && (
          <HomePage todaysAppointments={todaysAppointments} />
        )}
        {currentPage === 'calendar' && (
          <CalendarPage
            appointments={appointments}
            onNewAppointment={() => setNewAppointmentDialogOpen(true)}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {currentPage === 'clients' && (
          <ClientsPage
            clients={clients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClientClick={handleClientClick}
            onNewClient={() => setNewClientDialogOpen(true)}
          />
        )}
        {currentPage === 'client-profile' && selectedClient && (
          <ClientProfilePage
            client={selectedClient}
            appointments={appointments.filter(a => a.clientId === selectedClient.id)}
            onBack={handleBackToClients}
            onNewAppointment={() => setNewAppointmentDialogOpen(true)}
          />
        )}
      </main>

      <NewClientDialog
        open={newClientDialogOpen}
        onOpenChange={setNewClientDialogOpen}
        onSave={handleSaveClient}
      />

      <NewAppointmentDialog
        open={newAppointmentDialogOpen}
        onOpenChange={setNewAppointmentDialogOpen}
        onSave={handleSaveAppointment}
        clients={clients}
      />

      <AppointmentDetailsDrawer
        open={appointmentDrawerOpen}
        onOpenChange={setAppointmentDrawerOpen}
        appointment={selectedAppointment}
        client={appointmentClient}
        onCancel={handleCancelAppointment}
      />

      <Toaster />
    </div>
  );
}
