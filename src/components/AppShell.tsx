import { Search, ChevronDown, Home, Calendar, Users } from 'lucide-react';
import { Button } from './ui/button';

interface AppShellProps {
  children: React.ReactNode;
}

const NavItem = ({ icon: Icon, label, active }: { icon: React.ElementType, label: string, active: boolean }) => (
  <div className={`flex items-center px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
    active 
      ? 'bg-white/10 text-white rounded-r-md' // Active state style
      : 'text-gray-400 hover:bg-white/5 hover:text-white' // Inactive state style
  }`}>
    <Icon className="w-5 h-5 mr-3" />
    <span>{label}</span>
  </div>
);

export function AppShell({ children }: AppShellProps) {
  
  const UserAvatar = () => (
    <div className="flex items-center space-x-2 cursor-pointer">
      {/* Placeholder for the small profile picture */}
      <div className="w-8 h-8 bg-gray-300 rounded-full border border-gray-400"></div>
      <ChevronDown className="w-4 h-4 text-gray-700" />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Dark Background */}
      <aside className="w-64 bg-[#1e2024] flex-shrink-0 pt-6">
        <div className="px-6 mb-10">
          <div className="text-2xl font-bold text-white tracking-wider">RACHELLE</div>
        </div>
        <nav className="space-y-1">
          {/* Using 'Clients' as the active page based on the screenshot */}
          <NavItem icon={Home} label="Home" active={false} />
          <NavItem icon={Calendar} label="Calendar" active={false} />
          <NavItem icon={Users} label="Clients" active={true} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - White Background */}
        <header className="flex items-center justify-end p-3 bg-white border-b border-gray-200 flex-shrink-0 relative">
          <div className="flex items-center space-x-3 absolute left-1/2 transform -translate-x-1/2">
             {/* Top Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             {/* New Client Button (Styling matched to screenshot's top bar) */}
            <Button className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              New Client
            </Button>
            {/* Book Appointment Button (Styling matched to screenshot's top bar) */}
            <Button className="bg-[#1e2024] text-white hover:bg-[#1e2024]/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              Book Appointment
            </Button>
          </div>
        </header>

        {/* Content Area - This is where ClientsPage will render */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}