'use client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Client } from '../types';
import { Search } from 'lucide-react';
import { calculateFamilyFinances } from '../lib/calculations';

interface ClientsPageProps {
  clients: Client[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClientClick: (clientId: string) => void;
  onNewClient: () => void;
}

// Define the Deep Navy color as a Tailwind custom class for reuse
// deep-navy: #1E2024
const deepNavy = '#1E2024';

export function ClientsPage({
  clients,
  searchQuery,
  onSearchChange,
  onClientClick,
  onNewClient,
}: ClientsPageProps) {
if (!clients || !Array.isArray(clients)) {
  return <div>Loading clients...</div>; 
  // Or return null if you want to hide the component
}

  const filteredClients = (clients ?? []).filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  return (
    // 1. Set the page background to light gray (#F7F7F7)
    <div className="min-h-screen bg-[#F7F7F7] p-8">
      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          {/* 2. 'Clients' title: More elegant font (using a more pronounced font-weight and tracking) and Deep Navy color */}
          <h2
            className="text-4xl font-light tracking-wide"
            style={{ color: deepNavy, fontFamily: 'serif' }} // Using serif/light font for "elegant" look
          >
            Clients
          </h2>
          {/* 3. 'New Client' button: Deep Navy background and white text */}
          <Button
            onClick={onNewClient}
            className="px-5 py-3 rounded-lg text-sm font-medium shadow-md transition h-10"
            style={{ backgroundColor: deepNavy, color: 'white' }}
          >
            New Client
          </Button>
        </div>

        {/* Search Box - Keeping the clean look */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 pl-12 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-0 text-base shadow-sm"
            />
          </div>
        </div>

        {/* Clients Grid - Matches card look, uses Deep Navy for client names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => {
  // 1. Run the math for this client
  const { balance, isFullyPaid } = calculateFamilyFinances(client);
  const gownCount = client.projects?.length || 0;

  return (
    <button
      key={client.id}
      onClick={() => onClientClick(String(client.id))}
      // Changed h-32 to min-h-[140px] and added flex-col to stack data
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden"
    >
      {/* 2. Top corner badge for gown count */}
      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
        {gownCount} {gownCount === 1 ? 'Gown' : 'Gowns'}
      </span>

      {/* 3. Client Name (Deep Navy) */}
      <div
        className="font-bold text-lg leading-tight"
        style={{ color: deepNavy }}
      >
        {client.name}
      </div>

      {/* 4. Financial Status */}
      <div className={`text-sm font-medium ${isFullyPaid ? 'text-green-600' : 'text-rose-600'}`}>
        {isFullyPaid ? (
          'Fully Paid'
        ) : (
          <span>Owes {balance} NIS</span>
        )}
      </div>

      {/* 5. Warning Stripe if picked up but unpaid */}
      {/* (Assumes you have a field for this, otherwise remove) */}
      {!isFullyPaid && client.projects?.some(p => p.isPickedUp) && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" title="Picked up but not paid!" />
      )}
    </button>
  );
})}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No clients found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}