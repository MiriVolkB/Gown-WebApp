'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, DollarSign, Settings } from 'lucide-react'; 

// 1. Add the onClose prop to the Sidebar component
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 lg:w-80 bg-[#0B1120] text-slate-300 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800/50 shadow-2xl z-50 transition-all duration-300">      
      <div className="w-full aspect-[4/3] relative bg-[#0B1120] border-b border-slate-800/50 overflow-hidden shrink-0">
        <Image 
          src="/logo.jpg" 
          alt="Rachelli Custom Gowns" 
          fill
          sizes="(max-width: 1024px) 224px, 320px"
          className="object-cover object-center" 
          priority 
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{
            background:
              "linear-gradient(to top, #0B1120 0%, rgba(11,17,32,0.75) 35%, rgba(11,17,32,0.25) 70%, transparent 100%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
          }}
        />
      </div>

      <nav className="flex-1 px-4 lg:px-6 py-8 space-y-2 lg:space-y-4 transition-all"> 
        {/* 2. Pass the onClose prop down to each NavItem */}
        <NavItem href="/" icon={<Home size={22} />} label="Home" active={pathname === '/'} onClick={onClose} />
        <NavItem href="/calendar" icon={<Calendar size={22} />} label="Calendar" active={pathname === '/calendar'} onClick={onClose} />
        <NavItem href="/clients" icon={<Users size={22} />} label="Clients" active={pathname === '/clients'} onClick={onClose} />
        <NavItem href="/finances" icon={<DollarSign size={22} />} label="Finances" active={pathname === '/finances'} onClick={onClose} />
      </nav>

      <div className="p-4 lg:p-6 border-t border-slate-800/50">
         <NavItem href="/settings" icon={<Settings size={22} />} label="Settings" active={pathname === '/settings'} onClick={onClose} />
      </div>
    </aside>
  );
}

// 3. Accept the onClick prop in NavItem
function NavItem({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      // 4. Trigger the onClick function when the link is pressed
      onClick={onClick}
      className={`flex items-center space-x-3 lg:space-x-4 px-3 lg:px-5 py-3 lg:py-4 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-white/10 text-white shadow-lg border-l-4 border-[#C5A059]' 
          : 'hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={active ? "text-[#C5A059]" : "text-slate-400 group-hover:text-white"}>
        {icon}
      </span>
      
      <span className={`text-sm lg:text-base tracking-wide ${active ? "font-bold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
}