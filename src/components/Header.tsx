"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Calendar, CreditCard, Receipt, Menu, LogOut, User } from 'lucide-react';
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
import { GlobalClientSearch } from "@/components/GlobalClientSearch";

interface HeaderProps {
  username?: string | null;
  role?: string | null;
}

export default function Header({ username, role }: HeaderProps) {
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

    const initials = username
      ? username
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "";
    
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-50 px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2">
      
      {/* MOBILE HAMBURGER MENU */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-1 shrink-0">
            <Menu className="h-6 w-6 text-slate-700" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-slate-900">
          <Sidebar onClose={() => setIsMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* GLOBAL SEARCH */}
      <div className="flex-1 min-w-0 max-w-xl">
        {username ? (
          <GlobalClientSearch />
        ) : (
          <div className="h-9" aria-hidden />
        )}
      </div>

      {/* USER + QUICK ACTIONS + LOGOUT */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 md:ml-8 shrink-0">
        {username && (
          <>
            {/* Mobile: avatar only */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold"
                  aria-label={`Signed in as ${username}`}
                >
                  {initials || <User className="h-4 w-4" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {username}
                {role ? ` · ${role}` : ""}
              </TooltipContent>
            </Tooltip>

            {/* Tablet/Desktop: name + optional role */}
            <div className="hidden sm:flex items-center gap-2.5 max-w-[10rem] md:max-w-[14rem] lg:max-w-none px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                {initials || <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-medium text-slate-900 truncate">{username}</p>
                {role && (
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 truncate">
                    {role}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2 px-2.5 sm:px-3 md:px-4 shadow-sm">
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
