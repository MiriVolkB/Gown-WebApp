// src/app/calendar/page.tsx
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-slate-800">Calendar</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 transition">
          + New Appointment
        </button>
      </div>
      
      {/* Load our component */}
      <CalendarView />
    </div>
  );
}