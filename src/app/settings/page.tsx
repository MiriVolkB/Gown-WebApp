"use client";

import { LogOut, Clock, Save } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // Assuming you have 'sonner' installed for notifications

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. State for Business Hours
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 2. Load settings from Database when page opens
  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_settings')
        .select('day_start_time, day_end_time')
        .eq('user_id', user.id)
        .single();

      if (data) {
        // Supabase sends time as "09:00:00", we just want "09:00" for the input
        setStartTime(data.day_start_time.slice(0, 5));
        setEndTime(data.day_end_time.slice(0, 5));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  // 3. Save function
  const handleSaveHours = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('business_settings')
        .upsert({ 
          user_id: user.id,
          day_start_time: startTime,
          day_end_time: endTime 
        }, { onConflict: 'user_id' });

      if (error) {
        alert("Error saving settings!");
        console.error(error);
      } else {
        alert("Business hours saved!"); // Simple alert for now
      }
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login"); 
    router.refresh();
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
      <p className="text-slate-500 mb-8">Manage your business preferences.</p>

      <div className="space-y-6">
        
        {/* --- BUSINESS HOURS (Fully Functional) --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Business Hours
            </h2>
            {/* Save Button */}
            <button 
              onClick={handleSaveHours}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Daily Schedule</label>
                <div className="flex gap-2 items-center">
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <span className="text-slate-400">to</span>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">These hours will determine your calendar layout.</p>
            </div>
          </div>
        </section>

        {/* --- DANGER ZONE --- */}
        <section className="bg-red-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-700">Account</p>
              <p className="text-sm text-red-600/70">Log out of your account.</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}