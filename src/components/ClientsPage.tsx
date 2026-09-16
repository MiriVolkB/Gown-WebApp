'use client';

import { useState, useTransition, useDeferredValue } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ClientListItem } from '../types';
import { Search, Loader2, Calendar } from 'lucide-react';
import { calculateFamilyFinances } from '../lib/calculations';
import { format } from 'date-fns';

interface ClientsPageProps {
  clients: ClientListItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClientClick: (clientId: string) => void;
  onNewClient: () => void;
}

const deepNavy = '#1E2024';

export function ClientsPage({
  clients,
  searchQuery,
  onSearchChange,
  onClientClick,
  onNewClient,
}: ClientsPageProps) {
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Keep the input snappy; defer the list filter + per-card finance math
  const deferredQuery = useDeferredValue(searchQuery);
  const isFiltering = deferredQuery !== searchQuery;

  if (!clients || !Array.isArray(clients)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-slate-500 animate-in fade-in">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <span className="text-sm font-medium uppercase tracking-widest">Loading Database...</span>
      </div>
    );
  }

  const query = deferredQuery.trim().toLowerCase();
  const filteredClients = query
    ? clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(deferredQuery.trim())
      )
    : clients;

  const handleClientClick = (clientId: string) => {
    setLoadingClientId(clientId);

    startTransition(() => {
      onClientClick(clientId);
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto py-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2
            className="text-4xl font-light tracking-wide"
            style={{ color: deepNavy, fontFamily: "'Playfair Display', serif" }}
          >
            Clients
          </h2>
          <Button
            onClick={onNewClient}
            className="px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all h-11 hover:opacity-90 w-full sm:w-auto"
            style={{ backgroundColor: deepNavy, color: 'white' }}
          >
            New Client
          </Button>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 pl-12 rounded-xl border border-gray-200 focus:border-slate-400 focus:ring-0 text-base shadow-sm bg-white"
            />
          </div>
        </div>

        {/* Clients Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 transition-opacity ${
            isFiltering ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {filteredClients.map((client) => {
            const { balance, isFullyPaid } = calculateFamilyFinances(client);
            const gownCount = client.projects?.length || 0;
            const isLoading = loadingClientId === String(client.id);
            const isLead = gownCount === 0;

            // API already returns only the next upcoming appointment (take: 1)
            const nextAppointment = client.appointments?.[0];

            return (
              <button
                key={client.id}
                onClick={() => handleClientClick(String(client.id))}
                disabled={isLoading || loadingClientId !== null}
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all text-center flex flex-col items-center justify-between space-y-4 relative overflow-hidden min-h-[200px] group
                  ${isLoading ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:shadow-md hover:border-gray-200'}
                  ${loadingClientId !== null && !isLoading ? 'opacity-40 grayscale-[50%] cursor-not-allowed' : ''}
                `}
              >
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] animate-in fade-in">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Open...</span>
                  </div>
                )}

                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-gray-300 font-bold group-hover:text-gray-400 transition-colors">
                  {gownCount} {gownCount === 1 ? 'Gown' : 'Gowns'}
                </span>

                <div className="flex flex-col items-center space-y-2 w-full pt-2">
                  
                  <div className="text-[11px] uppercase tracking-widest text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                    💍 {client.WeddingDate ? format(new Date(client.WeddingDate), 'MMM dd, yyyy') : 'No Wedding Date'}
                  </div>

                  <div
                    className="font-bold text-xl leading-tight tracking-tight mt-1"
                    style={{ color: deepNavy }}
                  >
                    {client.name}
                  </div>

                  <div className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                    isLead ? 'bg-indigo-50 text-indigo-500' :
                    isFullyPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {isLead ? 'Consultation' : isFullyPaid ? 'Fully Paid' : `Owes ${balance} NIS`}
                  </div>

                  <div className="w-full mt-3 pt-3 border-t border-gray-100 flex flex-col items-center text-xs text-gray-500">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Next Appointment</span>
                    {nextAppointment ? (
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(new Date(nextAppointment.start), 'Pp')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic font-light">None Scheduled</span>
                    )}
                  </div>

                </div>

                {!isFullyPaid && client.projects?.some(p => p.isPickedUp) && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-500" title="Picked up but not paid!" />
                )}
              </button>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 mt-4">
            <p className="text-gray-400 text-sm italic">No clients found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
