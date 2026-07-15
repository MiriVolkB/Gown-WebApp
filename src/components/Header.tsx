"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, UserPlus, Calendar, CreditCard, Receipt, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModal } from "@/hooks/use-modal-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar"; 

export default function Header() {
    const { onOpen } = useModal();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      } catch (error) {
        console.error("Logout failed:", error);
        setIsLoggingOut(false);
      }
    };
    
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between gap-2">
      
      {/* MOBILE HAMBURGER MENU */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-1">
            <Menu className="h-6 w-6 text-slate-700" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-slate-900">
          <Sidebar onClose={() => setIsMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* GLOBAL SEARCH */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
      </div>

      {/* QUICK ACTIONS + LOGOUT */}
      <div className="flex items-center gap-2 ml-2 md:ml-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2 px-3 md:px-4 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Action</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl p-2 border-slate-100">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 py-2">Create New</DropdownMenuLabel>
            
            <DropdownMenuItem onSelect={() => onOpen("addClient")}>
              <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium text-sm">New Client</span>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onOpen("bookAppointment")}>
              <Calendar className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium text-sm">Book Appointment</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => onOpen("addPayment")}>
              <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="font-medium text-sm">Record Payment</span>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onOpen("addExpense")}>
              <Receipt className="h-4 w-4 mr-2 text-amber-600" />
              <span className="font-medium text-sm">Add Gown Expense</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile: icon with hover/tap label underneath */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="sm:hidden px-3 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </TooltipContent>
        </Tooltip>

        {/* Desktop: icon + text */}
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="hidden sm:inline-flex gap-2 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </Button>
      </div>
    </header>
  );
}