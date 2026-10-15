import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Trash2,
  Edit,
  Calendar as CalIcon,
  Clock,
  AlignLeft,
  AlertTriangle,
  ArrowRight,
  Phone,
  MessageCircle,
  Wallet,
  CalendarClock,
} from 'lucide-react';
import { GownIcon } from '@/components/icons/GownIcon';
import { format, differenceInCalendarDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';

interface AppointmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onDelete?: (id: number) => void;
  onEdit?: (event: any) => void;
}

// ---- Small helpers for the wedding panel ----

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('en-US')}`;

// 10 digits -> XXX-XXX-XXXX, 9 digits -> XX-XXX-XXXX, anything else unchanged
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  return raw;
}

// Number for a tap-to-call link
function telHref(raw: string): string {
  return `tel:${raw.replace(/[^\d+]/g, '')}`;
}

// WhatsApp wants the full international number, digits only. Returns null if we can't tell.
function whatsappHref(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  let intl: string | null = null;
  if (trimmed.startsWith('+')) intl = digits;
  else if (digits.startsWith('972') && digits.length >= 11) intl = digits;
  else if (digits.startsWith('0') && digits.length >= 9) intl = `972${digits.slice(1)}`; // Israeli
  else if (digits.length === 10) intl = `1${digits}`; // US / Canada
  return intl ? `https://wa.me/${intl}` : null;
}

function countdownLabel(start: Date): string {
  const days = differenceInCalendarDays(startOfDay(start), startOfDay(new Date()));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  RENTAL: 'Rental',
  CUSTOM_MAKE: 'Custom make',
  CUSTOM_MAKE_RENTAL: 'Custom + rental',
};

export default function AppointmentDetails({ isOpen, onClose, event, onDelete, onEdit }: AppointmentDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Wedding panel: load the full family details (gowns, payments, appointments) only when it is open.
  const weddingClientId =
    isOpen && event && (event.resource || event).type === 'wedding' ? (event.resource || event).id : null;

  const { data: family, isLoading: familyLoading, isError: familyError } = useQuery({
    queryKey: ['wedding-panel-client', weddingClientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${weddingClientId}`);
      if (!res.ok) throw new Error('Failed to load family details');
      return res.json();
    },
    enabled: weddingClientId != null,
    staleTime: 30_000,
  });

  if (!isOpen || !event) return null;

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await Promise.resolve(onDelete(event.id));
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const resource = event.resource || event;

  // Weddings have a date only (no time), a family name and a gown count
  const isWedding = resource.type === 'wedding';
  const gownCount =
    isWedding && typeof resource._count?.projects === 'number' ? (resource._count.projects as number) : null;
  const clientProfileHref = isWedding && resource.id != null ? `/clients/${resource.id}` : null;

  const dateStr = isWedding ? format(event.start, 'EEE, MMM d, yyyy') : format(event.start, 'dd/MM/yyyy');
  const timeStr = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

  const isCustomEvent = resource.clientId == null && Boolean(resource.title || event.title);
  const displayTitle = isWedding
    ? resource.name || 'Wedding'
    : resource.title ||
      event.title ||
      resource.client?.name ||
      event.client?.name ||
      'Untitled';
  const serviceName = isWedding
    ? 'Wedding'
    : resource.service?.name ||
      event.service?.name ||
      (isCustomEvent ? 'Custom Event' : 'Appointment');
  const notes = resource.notes || event.notes || '';
  const color = isWedding ? '#D4AF37' : resource.service?.color || event.service?.color || '#3b82f6';

  // ---- Wedding details (from the full client record) ----
  const phone: string = (family?.phone || resource.phone || '').trim();
  const waLink = phone ? whatsappHref(phone) : null;
  const familyNotes: string = (family?.notes || '').trim();

  const projects: any[] = Array.isArray(family?.projects) ? family.projects : [];
  const payments: any[] = Array.isArray(family?.payments) ? family.payments : [];
  const totalPrice = projects.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balance = totalPrice - totalPaid;
  const showMoney = projects.length > 0 || payments.length > 0;
  const paidPct = totalPrice > 0 ? Math.min(100, Math.round((totalPaid / totalPrice) * 100)) : 0;

  const now = new Date();
  const nextAppointment = (Array.isArray(family?.appointments) ? family.appointments : [])
    .filter((a: any) => new Date(a.start) >= now && String(a.status || '').toUpperCase() !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  const rowIcon = 'p-2 md:p-2.5 rounded-lg shrink-0';

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

        <div
          className={`h-24 md:h-32 p-4 md:p-6 flex items-start justify-between shrink-0 ${
            isWedding ? 'text-[#0F172A]' : 'text-white'
          }`}
          style={{ backgroundColor: color }}
        >
          <h2 className="text-lg md:text-xl font-bold opacity-95 tracking-tight pr-2">{serviceName}</h2>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 md:px-6 -mt-6 md:-mt-8 overflow-y-auto min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-5 md:space-y-6 mb-4">

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {isWedding ? 'Family' : isCustomEvent ? 'Event Title' : 'Client'}
              </label>
              <h3 dir="auto" className="text-xl md:text-2xl font-bold text-gray-900 mt-1 break-words">{displayTitle}</h3>
            </div>

            <hr className="border-gray-100" />

            <div className={isWedding ? 'space-y-4' : 'space-y-5 md:space-y-6'}>
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`${rowIcon} bg-blue-50 text-blue-600`}>
                  <CalIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">{isWedding ? 'Wedding date' : 'Date'}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                    <p className="text-sm text-gray-600">{dateStr}</p>
                    {isWedding && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0F172A]/10 px-2 py-0.5 text-xs font-semibold text-[#0F172A]">
                        <Clock className="w-3 h-3" />
                        {countdownLabel(event.start)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isWedding && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${rowIcon} bg-purple-50 text-purple-600`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Time</p>
                    <p className="text-sm text-gray-600 mt-0.5">{timeStr}</p>
                  </div>
                </div>
              )}

              {/* ---- Wedding: phone + quick actions ---- */}
              {isWedding && phone && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${rowIcon} bg-green-50 text-green-600`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="text-sm font-semibold text-gray-900 tabular-nums pt-0.5">
                      {formatPhone(phone)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a
                        href={telHref(phone)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Wedding: gowns ---- */}
              {isWedding && gownCount !== null && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${rowIcon} bg-amber-50 text-amber-600`}>
                    <GownIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {familyLoading && (
                      <>
                        <p className="text-sm font-bold text-gray-900">
                          {gownCount} {gownCount === 1 ? 'gown' : 'gowns'}
                        </p>
                        <div className="mt-2 h-10 rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />
                      </>
                    )}

                    {!familyLoading && projects.length === 0 && (
                      <p className="text-sm text-gray-500">No gowns yet</p>
                    )}

                    {projects.length > 0 && (
                      <ul className="space-y-2">
                        {projects.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p dir="auto" className="text-sm font-semibold text-gray-900 truncate">
                                {p.memberName || 'Gown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ORDER_TYPE_LABEL[p.orderType] || p.orderType}
                                {' · '}
                                <span className={p.isPickedUp ? 'text-green-600 font-medium' : ''}>
                                  {p.isPickedUp ? 'Picked up' : 'Not picked up'}
                                </span>
                              </p>
                            </div>
                            <span className="text-sm font-medium text-gray-600 tabular-nums shrink-0">
                              {shekel(Number(p.price) || 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ---- Wedding: money (one line + progress bar) ---- */}
              {isWedding && showMoney && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${rowIcon} bg-emerald-50 text-emerald-600`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-700 tabular-nums">
                        <span className="font-bold text-gray-900">{shekel(totalPaid)}</span> of {shekel(totalPrice)} paid
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                          balance > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {balance > 0 ? `${shekel(balance)} left` : 'Fully paid ✓'}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${balance > 0 ? 'bg-orange-400' : 'bg-green-500'}`}
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {isWedding && familyError && (
                <p className="text-xs text-gray-400">Couldn&apos;t load more details. Open the client profile to see everything.</p>
              )}

              {(notes || familyNotes) && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${rowIcon} bg-amber-50 text-amber-600`}>
                    <AlignLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Notes</p>
                    <p dir="auto" className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap leading-relaxed">
                      {notes || familyNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isWedding && nextAppointment && (
              <p className="flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <CalendarClock className="w-4 h-4 shrink-0 text-purple-500" />
                <span className="min-w-0">
                  Next: {nextAppointment.service?.name ? `${nextAppointment.service.name} · ` : ''}
                  {format(new Date(nextAppointment.start), 'EEE, MMM d · HH:mm')}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-3 mt-auto shrink-0 safe-area-pb">
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
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

          {clientProfileHref && (
            <Link
              href={clientProfileHref}
              className="flex items-center gap-2 px-4 py-2.5 text-[#0F172A] hover:bg-gray-200/60 rounded-lg text-sm font-semibold transition-colors ml-auto"
            >
              Open client profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold">Delete Appointment</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'OK'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}