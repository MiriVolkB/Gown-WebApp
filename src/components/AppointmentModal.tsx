import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// --- TYPES ---
interface Client {
  id: number;
  name: string;
  email: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSave: (appointmentData: any) => void;
}

// --- CONFIG: Service Options & Times ---
const SERVICE_OPTIONS = [
  { label: 'First Appointment', duration: 30 },
  { label: 'First Fitting', duration: 30 },
  { label: 'Second Fitting', duration: 30 },
  { label: 'Third Fitting', duration: 30 },
  { label: 'Pick Up', duration: 45 },
];

export default function AppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onSave,
}: AppointmentModalProps) {
  
  // --- STATE ---
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    title: '', 
    clientId: '',
    date: '', // Keeps YYYY-MM-DD for database
    time: '09:00', 
    duration: 30, 
    notes: '',
  });

  // --- UI STATE: DATE (Day / Month / Year) ---
  const [uiDay, setUiDay] = useState('');
  const [uiMonth, setUiMonth] = useState('');
  const [uiYear, setUiYear] = useState('');

  // --- UI STATE: TIME (Hour / Minute / AM/PM) ---
  const [uiHour, setUiHour] = useState('09');
  const [uiMinute, setUiMinute] = useState('00');
  const [uiPeriod, setUiPeriod] = useState<'AM' | 'PM'>('AM');

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- EFFECT: Sync UI when Modal Opens ---
  useEffect(() => {
    if (isOpen) {
      // 1. Setup Date (From Calendar Click)
      let initialDateStr = '';
      if (selectedDate) {
        // Create YYYY-MM-DD string
        initialDateStr = selectedDate.toISOString().split('T')[0];
        // Set UI Boxes
        setUiDay(selectedDate.getDate().toString().padStart(2, '0'));
        setUiMonth((selectedDate.getMonth() + 1).toString().padStart(2, '0'));
        setUiYear(selectedDate.getFullYear().toString());
      }

      // 2. Setup Time (From Calendar Click)
      const initialTime = selectedTime || '09:00';
      const [h, m] = initialTime.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12; 
      
      setUiHour(hour12.toString().padStart(2, '0'));
      setUiMinute(m.toString().padStart(2, '0'));
      setUiPeriod(period);

      // 3. Reset Form Data
      setFormData({
        title: '',
        clientId: '',
        date: initialDateStr,
        time: initialTime,
        duration: 30,
        notes: '',
      });
      setSearchTerm("");
      setIsDropdownOpen(false);

      // 4. Load Clients
      fetch('/api/clients')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
          else setClients([]); 
        })
        .catch((err) => {
          console.error("Failed to load clients", err);
          setClients([]);
        });
    }
  }, [isOpen, selectedDate, selectedTime]);

  // --- LOGIC: Filter Clients ---
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HELPER: Update Date (UI -> Real) ---
  const updateRealDate = (d: string, m: string, y: string) => {
    // Format: YYYY-MM-DD
    const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, date: isoDate }));
  };

  // --- HELPER: Update Time (UI -> Real) ---
  const updateRealTime = (hStr: string, mStr: string, pStr: string) => {
    let h = parseInt(hStr) || 0;
    const m = mStr.padStart(2, '0');
    
    if (pStr === 'PM' && h !== 12) h += 12;
    if (pStr === 'AM' && h === 12) h = 0;

    const time24 = `${h.toString().padStart(2, '0')}:${m}`;
    setFormData(prev => ({ ...prev, time: time24 }));
  };

  // --- HANDLERS: Date Cleanup ---
  const handleDayBlur = () => {
    let d = parseInt(uiDay);
    if (isNaN(d) || d < 1) d = 1;
    if (d > 31) d = 31;
    const cleanD = d.toString().padStart(2, '0');
    setUiDay(cleanD);
    updateRealDate(cleanD, uiMonth, uiYear);
  };

  const handleMonthBlur = () => {
    let m = parseInt(uiMonth);
    if (isNaN(m) || m < 1) m = 1;
    if (m > 12) m = 12;
    const cleanM = m.toString().padStart(2, '0');
    setUiMonth(cleanM);
    updateRealDate(uiDay, cleanM, uiYear);
  };

  // --- HANDLERS: Time Cleanup ---
  const handleHourBlur = () => {
    let val = parseInt(uiHour);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 12) val = 12;
    const cleanHour = val.toString().padStart(2, '0');
    setUiHour(cleanHour);
    updateRealTime(cleanHour, uiMinute, uiPeriod);
  };

  const handleMinuteBlur = () => {
    let val = parseInt(uiMinute);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 59) val = 59;
    const cleanMinute = val.toString().padStart(2, '0');
    setUiMinute(cleanMinute);
    updateRealTime(uiHour, cleanMinute, uiPeriod);
  };

  const togglePeriod = () => {
    const newPeriod = uiPeriod === 'AM' ? 'PM' : 'AM';
    setUiPeriod(newPeriod);
    updateRealTime(uiHour, uiMinute, newPeriod);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceLabel = e.target.value;
    const serviceOption = SERVICE_OPTIONS.find(opt => opt.label === selectedServiceLabel);
    setFormData({
      ...formData,
      title: selectedServiceLabel,
      duration: serviceOption ? serviceOption.duration : 30
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      New Appointment
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      
                      {/* 1. CLIENT SEARCH */}
                      <div className="relative z-50">
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input
                          type="text"
                          placeholder="Type to search client..."
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(e.target.value.length > 0);
                            setFormData({ ...formData, clientId: "" }); 
                          }}
                        />
                        {isDropdownOpen && (
                          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                            {filteredClients.length > 0 ? (
                              filteredClients.map((client) => (
                                <div
                                  key={client.id}
                                  className="cursor-pointer px-4 py-2 hover:bg-pink-50 text-sm text-gray-700"
                                  onClick={() => {
                                    setFormData({ ...formData, clientId: String(client.id) });
                                    setSearchTerm(client.name);
                                    setIsDropdownOpen(false); 
                                  }}
                                >
                                  <span className="font-medium">{client.name}</span>
                                  <span className="ml-2 text-xs text-gray-400">({client.email})</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-gray-500">No client found</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. SERVICE SELECTOR */}
                      <div className="relative z-10">
                        <label className="block text-sm font-medium text-gray-700">Service</label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                          value={formData.title}
                          onChange={handleServiceChange}
                        >
                          <option value="">Select a Service...</option>
                          {SERVICE_OPTIONS.map((option) => (
                            <option key={option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. CUSTOM DATE & TIME PICKERS */}
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* --- ISRAELI DATE PICKER (DD / MM / YYYY) --- */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date (DD/MM/YYYY)</label>
                          <div className="mt-1 flex items-center gap-1">
                            {/* Day */}
                            <input
                              type="text"
                              maxLength={2}
                              placeholder="DD"
                              className="w-12 rounded-md border border-gray-300 px-1 py-2 text-center shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                              value={uiDay}
                              onChange={(e) => setUiDay(e.target.value)}
                              onBlur={handleDayBlur}
                              onFocus={(e) => e.target.select()}
                            />
                            <span className="text-gray-400">/</span>
                            {/* Month */}
                            <input
                              type="text"
                              maxLength={2}
                              placeholder="MM"
                              className="w-12 rounded-md border border-gray-300 px-1 py-2 text-center shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                              value={uiMonth}
                              onChange={(e) => setUiMonth(e.target.value)}
                              onBlur={handleMonthBlur}
                              onFocus={(e) => e.target.select()}
                            />
                            <span className="text-gray-400">/</span>
                            {/* Year */}
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="YYYY"
                              className="w-16 rounded-md border border-gray-300 px-1 py-2 text-center shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                              value={uiYear}
                              onChange={(e) => {
                                setUiYear(e.target.value);
                                updateRealDate(uiDay, uiMonth, e.target.value);
                              }}
                              onFocus={(e) => e.target.select()}
                            />
                          </div>
                        </div>

                        {/* --- CUSTOM TIME PICKER --- */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Time</label>
                          <div className="mt-1 flex items-center gap-2">
                            {/* Hour */}
                            <input
                              type="text"
                              maxLength={2}
                              className="w-12 rounded-md border border-gray-300 px-1 py-2 text-center shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                              value={uiHour}
                              onChange={(e) => setUiHour(e.target.value)}
                              onBlur={handleHourBlur}
                              onFocus={(e) => e.target.select()} 
                            />
                            <span className="text-gray-500 font-bold">:</span>
                            {/* Minute */}
                            <input
                              type="text"
                              maxLength={2}
                              className="w-12 rounded-md border border-gray-300 px-1 py-2 text-center shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                              value={uiMinute}
                              onChange={(e) => setUiMinute(e.target.value)}
                              onBlur={handleMinuteBlur}
                              onFocus={(e) => e.target.select()} 
                            />
                            {/* AM/PM */}
                            <button
                              type="button"
                              onClick={togglePeriod}
                              className={`w-12 rounded-md px-1 py-2 text-sm font-bold shadow-sm transition-colors border ${
                                uiPeriod === 'AM' 
                                  ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              }`}
                            >
                              {uiPeriod}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. DURATION */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                        <select
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>

                      {/* 5. NOTES */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                          rows={3}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 sm:ml-3 sm:w-auto"
                        >
                          Save Appointment
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}