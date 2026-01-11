'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; 
import { ClientsPage } from '@/components/ClientsPage';
import { Client } from '@/types';

const fetchClients = async (): Promise<Client[]> => {
  const res = await fetch('/api/clients');
  if (!res.ok) {
    throw new Error('Failed to fetch clients');
  }
  return res.json();
};

export default function ClientsPageRoute() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  // handlers
  const handleClientClick = (clientId: string) => {
    //console.log('Button clicked! Client ID:', clientId);
    router.push(`/clients/${clientId}`);
  };

  const handleNewClient = () => {
    router.push('/clients/new'); // <-- navigate to new client page
  };

  if (isLoading) return <div>Loading clients...</div>;
  if (error) return <div>Error loading clients</div>;

  return (
    <ClientsPage
      clients={clients}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onClientClick={handleClientClick}
      onNewClient={handleNewClient}
    />
  );
}
