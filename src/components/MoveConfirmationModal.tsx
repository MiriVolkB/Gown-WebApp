'use client';

import React, { useState } from 'react';
import { X, Calendar, ArrowRight, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface MoveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notify: boolean) => void;
  event: any;
  newStart: Date;
  newEnd: Date;
}

export default function MoveConfirmationModal({ 
  isOpen, onClose, onConfirm, event, newStart, newEnd 
}: MoveConfirmationModalProps) {
  
  // Default to sending email? standard practice is usually YES for reschedules.
  const [notify, setNotify] = useState(true); 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Box */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
            <p className="text-sm text-gray-500 mt-1">
              You are moving <strong>{event?.title}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Time Change Visual */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
          <div className="flex items-center justify-between text-sm">
            
            {/* Old Time */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">From</span>
              <div className="font-medium text-gray-700 mt-1">
                {event?.start && format(event.start, 'MMM d, yyyy')}
              </div>
              <div className="text-gray-900 font-bold text-lg">
                {event?.start && format(event.start, 'h:mm a')}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-5 h-5 text-slate-400 mx-2" />

            {/* New Time */}
            <div className="flex flex-col text-right">
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">To</span>
              <div className="font-medium text-gray-700 mt-1">
                {format(newStart, 'MMM d, yyyy')}
              </div>
              <div className="text-blue-700 font-bold text-lg">
                {format(newStart, 'h:mm a')}
              </div>
            </div>
          </div>
        </div>

        {/* Notify Checkbox */}
        <label className="flex items-start gap-3 p-3 border border-blue-100 bg-blue-50/50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Mail className="w-4 h-4 text-blue-600" />
              Notify Client via Email
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Send an automated email with the new time details.
            </p>
          </div>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(notify)} 
            className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium shadow-sm"
          >
            Confirm Move
          </button>
        </div>

      </div>
    </div>
  );
}