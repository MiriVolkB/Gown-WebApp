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
    <div className="p-8 pt-32"> 
      {/* Added top padding because you have a fixed header */}
      
      {/* Header Line */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-[var(--font-playfair)]">
          Clients
        </h2>

        <Button onClick={onNewClient}>New Client</Button>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => onClientClick(String(client.id))}
            className="bg-white border border-border rounded-lg p-6 text-left hover:shadow-md transition-all hover:border-primary/30"
          >
            <div className="font-medium">{client.name}</div>
            <div className="text-sm text-muted-foreground">{client.phone}</div>
            <div className="text-xs text-muted-foreground">
              {client.measurements?.length ?? 0} measurements
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No clients found matching your search.
        </div>
      )}
    </div>
  );
}
