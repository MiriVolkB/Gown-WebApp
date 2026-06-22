"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentWithService } from '@/types';

interface AppointmentListProps {
  appointments: AppointmentWithService[];
  onEdit: (apt: AppointmentWithService) => void;
  onCancel: (id: number) => Promise<void> | void;
}

export function AppointmentList({ appointments, onEdit, onCancel }: AppointmentListProps) {
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // NEW: Keep track of items we deleted locally so we can hide them instantly!
  const [optimisticallyDeletedIds, setOptimisticallyDeletedIds] = useState<Set<number>>(new Set());

  const handleConfirmCancel = () => {
    if (!cancelingId) return;
    const idToDelete = cancelingId;
    
    setIsDeleting(true);

    // 1. INSTANT UI UPDATE: Hide the appointment from the list immediately
    setOptimisticallyDeletedIds(prev => new Set(prev).add(idToDelete));
    
    // 2. Show the success screen immediately
    setShowSuccess(true);
    
    // 3. Close the modal quickly (1.2 seconds feels fast and responsive)
    setTimeout(() => {
      setShowSuccess(false);
      setCancelingId(null);
      setIsDeleting(false);
    }, 1200);

    // 4. Fire the server request in the background (Notice we don't 'await' it here!)
    Promise.resolve(onCancel(idToDelete)).catch((error) => {
      console.error("Failed to delete appointment:", error);
      // If the server fails, put the appointment back on the screen so the user knows
      setOptimisticallyDeletedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(idToDelete);
        return newSet;
      });
    });
  };

  // Filter out any appointments we just "deleted" optimistically
  const visibleAppointments = appointments.filter(apt => !optimisticallyDeletedIds.has(apt.id));

  if (visibleAppointments.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-gray-200 rounded-xl animate-in fade-in">
        <p className="text-gray-500 italic">No appointments scheduled yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {visibleAppointments.map((apt) => {
          const appointmentDate = apt.start ? new Date(apt.start) : (apt.date ? new Date(apt.date) : null);
          const displayTime = appointmentDate && !isNaN(appointmentDate.getTime()) 
            ? format(appointmentDate, 'HH:mm') : '--:--';
          const amPm = appointmentDate && !isNaN(appointmentDate.getTime()) 
            ? format(appointmentDate, 'aaa') : '';
          const serviceName = apt.service?.name ?? (apt as any).serviceName ?? "Gown Fitting";
          const currentStatus = apt.status ?? "SCHEDULED";

          return (
            <div key={apt.id} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors group animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
                
                {/* LEFT SIDE: TIME & DETAILS */}
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-[240px]">
                  <div className="flex flex-col items-center justify-center pr-4 sm:pr-6 border-r border-gray-100 min-w-[90px] shrink-0">
                    <span className="text-3xl font-light tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {displayTime}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                      {amPm}
                    </span>
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 truncate">
                        {serviceName}
                      </span>
                      <span className={`shrink-0 whitespace-nowrap px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        currentStatus === 'SCHEDULED' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {currentStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="font-medium truncate">
                        {appointmentDate && !isNaN(appointmentDate.getTime()) ? format(appointmentDate, 'EEEE, MMMM do, yyyy') : 'Date not set'}
                      </span>
                    </div>
                    
                    {apt.notes && (
                      <div className="mt-2 flex items-start gap-2 p-3 bg-slate-50/80 rounded-lg border border-slate-100 italic text-slate-600 text-sm max-w-md">
                        <FileText className="w-4 h-4 mt-0.5 text-slate-300 shrink-0" />
                        <span className="line-clamp-2">"{apt.notes}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: ACTION BUTTONS */}
                <div className="flex items-center gap-2 justify-end w-full sm:w-auto mt-2 sm:mt-0">
                  <Button variant="outline" className="text-xs border-gray-200 h-9 px-4 hover:bg-white shadow-sm" onClick={() => onEdit(apt)}>
                    Edit
                  </Button>
                  <Button variant="outline" className="text-xs border-gray-200 h-9 px-4 text-red-600 hover:bg-red-50 hover:border-red-100 shadow-sm" onClick={() => setCancelingId(apt.id)}>
                    Cancel
                  </Button>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>

      {/* THE FRIENDLY CANCEL CONFIRMATION MODAL */}
      {cancelingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            {showSuccess ? (
              /* SUCCESS SCREEN */
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                <div className="animate-bounce">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Canceled!</h2>
                <p className="text-slate-500 text-sm">The appointment was removed from the calendar.</p>
              </div>
            ) : (
              /* CONFIRMATION SCREEN */
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-bold">Cancel Appointment</h3>
                  </div>
                  <button 
                    onClick={() => !isDeleting && setCancelingId(null)}
                    disabled={isDeleting}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 text-center space-y-3">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Are you sure you want to cancel this appointment? This action will permanently remove it from the schedule.
                  </p>
                </div>

                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    onClick={() => setCancelingId(null)}
                    disabled={isDeleting}
                    className="flex-1 bg-white"
                  >
                    Keep it
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleConfirmCancel}
                    disabled={isDeleting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                  >
                    {isDeleting ? 'Canceling...' : 'Yes, Cancel'}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}