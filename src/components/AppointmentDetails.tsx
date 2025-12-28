import React from 'react';
import { X, Trash2, Edit, Calendar as CalIcon, Clock, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onDelete: (id: number) => void;
  onEdit: (event: any) => void;
}

export default function AppointmentDetails({ isOpen, onClose, event, onDelete, onEdit }: AppointmentDetailsProps) {
  if (!isOpen || !event) return null;

  // FIX 5: Date Format DD/MM/YYYY
  const dateStr = format(event.start, 'dd/MM/yyyy'); 
  const timeStr = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;
  
  const clientName = event.title || 'Unknown Client';
  const serviceName = event.resource?.service?.name || 'Appointment';
  const notes = event.resource?.notes || '';
  const color = event.resource?.service?.color || '#3b82f6';

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 transform transition-transform duration-200">
      <div className="h-32 p-6 flex items-start justify-between text-white" style={{ backgroundColor: color }}>
        <h2 className="text-xl font-bold opacity-95 tracking-tight">{serviceName}</h2>
        <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 -mt-8 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client</label>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{clientName}</h3>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <CalIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Date</p>
                <p className="text-sm text-gray-600 mt-0.5">{dateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Time</p>
                <p className="text-sm text-gray-600 mt-0.5">{timeStr}</p>
              </div>
            </div>

            {notes && (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Notes</p>
                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center mt-auto">
        <button 
          onClick={() => { onDelete(event.id); onClose(); }}
          className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>

        <button 
          onClick={() => onEdit(event)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Appointment
        </button>
      </div>
    </div>
  );
}