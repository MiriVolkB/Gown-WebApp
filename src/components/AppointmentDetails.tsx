import React from 'react';
import { X, Trash2, Edit, Calendar as CalIcon, Clock, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onDelete?: (id: number) => void;
  onEdit?: (event: any) => void;
}

export default function AppointmentDetails({ isOpen, onClose, event, onDelete, onEdit }: AppointmentDetailsProps) {
  if (!isOpen || !event) return null;

  const resource = event.resource || event;
  const dateStr = format(event.start, 'dd/MM/yyyy');
  const timeStr = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

  const isCustomEvent = resource.clientId == null && Boolean(resource.title || event.title);
  const displayTitle =
    resource.title ||
    event.title ||
    resource.client?.name ||
    event.client?.name ||
    'Untitled';
  const serviceName =
    resource.service?.name ||
    event.service?.name ||
    (isCustomEvent ? 'Custom Event' : 'Appointment');
  const notes = resource.notes || event.notes || '';
  const color = resource.service?.color || event.service?.color || '#3b82f6';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 md:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[400px] max-h-[85dvh] md:max-h-none bg-white shadow-2xl z-50 flex flex-col border-t md:border-t-0 md:border-l border-gray-100 rounded-t-2xl md:rounded-none transform transition-transform duration-200">
        <div className="flex justify-center pt-2 pb-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="h-24 md:h-32 p-4 md:p-6 flex items-start justify-between text-white shrink-0" style={{ backgroundColor: color }}>
          <h2 className="text-lg md:text-xl font-bold opacity-95 tracking-tight pr-2">{serviceName}</h2>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 md:px-6 -mt-6 md:-mt-8 overflow-y-auto min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-5 md:space-y-6">
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {isCustomEvent ? 'Event Title' : 'Client'}
              </label>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1 break-words">{displayTitle}</h3>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-5 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <CalIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Date</p>
                  <p className="text-sm text-gray-600 mt-0.5">{dateStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 md:p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Time</p>
                  <p className="text-sm text-gray-600 mt-0.5">{timeStr}</p>
                </div>
              </div>

              {notes && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
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

        <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-3 mt-auto shrink-0 safe-area-pb">
          {onDelete && (
            <button 
              onClick={() => { onDelete(event.id); onClose(); }}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}

          {onEdit && (
            <button 
              onClick={() => onEdit(event)}
              className="flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors ml-auto"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
