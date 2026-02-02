"use client";

import { Search, Plus, UserPlus, Calendar, CreditCard, Receipt } from 'lucide-react';
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

export default function Header() {
    const { onOpen } = useModal();
    

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-50 px-8 flex items-center justify-between">
      
      {/* GLOBAL SEARCH */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex items-center gap-4 ml-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2 px-4 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Quick Action</span>
            </Button>
          </DropdownMenuTrigger>
          
          {/* QUICK ACTIONS */}
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
      </div>
    </header>
  );
}