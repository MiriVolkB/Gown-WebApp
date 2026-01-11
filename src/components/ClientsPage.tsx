'use client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Client } from '../types';
import { Search } from 'lucide-react';

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
  const filteredClients = clients.filter(
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
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onClientClick(String(client.id))}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition text-center h-32 flex items-center justify-center"
            >
              {/* Client Name: Deep Navy color */}
              <div
                className="font-medium text-lg"
                style={{ color: deepNavy }}
              >
                {client.name}
              </div>
            </button>
          ))}
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