'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, DollarSign, Settings } from 'lucide-react'; 

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // CHANGE 1: Responsive Width (w-64 on medium/small, lg:w-80 on large monitors)
    <aside className="w-64 lg:w-80 bg-[#0B1120] text-slate-300 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800/50 shadow-2xl z-50 transition-all duration-300">
      
      {/* CHANGE 2: Responsive Logo Height (h-48 on laptop, lg:h-64 on desktop) */}
      <div className="h-48 lg:h-64 flex items-center justify-center border-b border-slate-800/50 relative bg-[#0B1120] transition-all duration-300">
        <div className="relative w-full h-full">
            <Image 
              src="/logo.jpg" 
              alt="Rachelli Custom Gowns" 
              fill
              className="object-cover" 
              priority 
            />
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
        </div>
      </div>

      {/* Navigation Menu: Tightened padding (px-4 laptop, lg:px-6 desktop) */}
      <nav className="flex-1 px-4 lg:px-6 py-8 space-y-2 lg:space-y-4 transition-all"> 
        <NavItem href="/" icon={<Home size={22} />} label="Home" active={pathname === '/'} />
        <NavItem href="/calendar" icon={<Calendar size={22} />} label="Calendar" active={pathname === '/calendar'} />
        <NavItem href="/clients" icon={<Users size={22} />} label="Clients" active={pathname === '/clients'} />
        <NavItem href="/finances" icon={<DollarSign size={22} />} label="Finances" active={pathname === '/finances'} />
      </nav>

      {/* Bottom Settings */}
      <div className="p-4 lg:p-6 border-t border-slate-800/50">
         <NavItem href="/settings" icon={<Settings size={22} />} label="Settings" active={pathname === '/settings'} />
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      // CHANGE 3: Responsive NavItem padding and font size
      className={`flex items-center space-x-3 lg:space-x-4 px-3 lg:px-5 py-3 lg:py-4 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-white/10 text-white shadow-lg border-l-4 border-[#C5A059]' 
          : 'hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={active ? "text-[#C5A059]" : "text-slate-400 group-hover:text-white"}>
        {icon}
      </span>
      
      {/* Label shrinks slightly on laptop screens */}
      <span className={`text-sm lg:text-base tracking-wide ${active ? "font-bold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
}