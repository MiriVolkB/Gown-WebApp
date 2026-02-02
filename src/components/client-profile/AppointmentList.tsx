"use client";

import React from 'react';
import { format } from 'date-fns';
import { Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (apt: Appointment) => void;
  onCancel: (id: number) => void;
}

export function AppointmentList({ appointments, onEdit, onCancel }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-gray-200 rounded-xl">
        <p className="text-gray-500 italic">No appointments scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {appointments.map((apt) => {
        // --- ALL THE "MESSY" LOGIC MOVED HERE ---
        const appointmentDate = apt.start ? new Date(apt.start) : (apt.date ? new Date(apt.date) : null);
        const displayTime = appointmentDate && !isNaN(appointmentDate.getTime()) 
          ? format(appointmentDate, 'HH:mm') : '--:--';
        const amPm = appointmentDate && !isNaN(appointmentDate.getTime()) 
          ? format(appointmentDate, 'aaa') : '';
        const serviceName = apt.service?.name ?? (apt as any).serviceName ?? "Gown Fitting";
        const currentStatus = apt.status ?? "SCHEDULED";

        return (
          <div key={apt.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                {/* TIME */}
                <div className="flex flex-col items-center justify-center pr-6 border-r border-gray-100 min-w-[100px]">
                  <span className="text-3xl font-light tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {displayTime}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                    {amPm}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl tracking-tight text-slate-900">{serviceName}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                      currentStatus === 'SCHEDULED' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    <span className="font-medium">
                      {appointmentDate && !isNaN(appointmentDate.getTime()) ? format(appointmentDate, 'EEEE, MMMM do, yyyy') : 'Date not set'}
                    </span>
                  </div>
                  {apt.notes && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-slate-50/80 rounded-lg border border-slate-100 italic text-slate-600 text-sm max-w-md">
                      <FileText className="w-4 h-4 mt-0.5 text-slate-300 shrink-0" />
                      "{apt.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Button variant="outline" className="text-xs border-gray-200 h-9 px-4 hover:bg-white shadow-sm" onClick={() => onEdit(apt)}>
                  Edit
                </Button>
                <Button variant="outline" className="text-xs border-gray-200 h-9 px-4 text-red-600 hover:bg-red-50 hover:border-red-100 shadow-sm" onClick={() => onCancel(apt.id)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}