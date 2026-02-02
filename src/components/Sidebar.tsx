// src/components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, DollarSign, Settings } from 'lucide-react'; 

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // CHANGE 1: Darker, Richer Navy Background (bg-[#0B1120])
    <aside className="w-80 bg-[#0B1120] text-slate-300 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800/50 shadow-2xl z-50">
      
      {/* CHANGE 2: Bigger Logo Area (h-64) and LESS padding (p-0) so it fills the space */}
      <div className="h-64 flex items-center justify-center border-b border-slate-800/50 relative bg-[#0B1120]">
        <div className="relative w-full h-full">
            <Image 
              src="/logo.jpg" 
              alt="Rachelli Custom Gowns" 
              fill
              className="object-cover" // object-cover makes it fill the box completely
              priority 
            />
            {/* Optional: A subtle gradient overlay at the bottom to blend it into the menu */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-6 py-8 space-y-4"> 
        <NavItem href="/" icon={<Home size={22} />} label="Home" active={pathname === '/'} />
        <NavItem href="/calendar" icon={<Calendar size={22} />} label="Calendar" active={pathname === '/calendar'} />
        <NavItem href="/clients" icon={<Users size={22} />} label="Clients" active={pathname === '/clients'} />
        <NavItem href="/finances" icon={<DollarSign size={22} />} label="Finances" active={pathname === '/finances'} />
      </nav>

      {/* Bottom Settings */}
      <div className="p-6 border-t border-slate-800/50">
         <NavItem href="/settings" icon={<Settings size={22} />} label="Settings" active={pathname === '/settings'} />
      </div>
    </aside>
  );
}

// CHANGE 3: "Gold" Active State
function NavItem({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-white/10 text-white shadow-lg border-l-4 border-[#C5A059]' // Gold border accent
          : 'hover:bg-white/5 hover:text-white'
      }`}
    >
      {/* Icon color changes on active */}
      <span className={active ? "text-[#C5A059]" : "text-slate-400 group-hover:text-white"}>
        {icon}
      </span>
      
      <span className={`text-base tracking-wide ${active ? "font-bold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
}