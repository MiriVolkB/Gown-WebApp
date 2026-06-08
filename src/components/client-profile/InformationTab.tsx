"use client";
import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import { DetailItem } from "./DetailItem";

export type ClientProfileData = Prisma.ClientGetPayload<{
  include: {
    projects: {
      include: {
        measurements: true;
        expenses: true;
      };
    };
    payments: true;
    appointments: {
      include: {
        service: true;
      };
    };
  };
}>;

export function InformationTab({ client }: { client: ClientProfileData }) {
    const router = useRouter();

    // 1. Local state for inline editing
  const [clientData, setClientData] = useState({
    name: client.name,
    phone: client.phone,
    email: client.email || '',
    dueDate: client.dueDate,
    WeddingDate: client.WeddingDate,
  });

// ADD THIS BLOCK: Keep local state in sync with server data
  useEffect(() => {
    setClientData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      dueDate: client.dueDate,
      WeddingDate: client.WeddingDate,
    });
  }, [client]); // Runs whenever the 'client' prop changes

// 2. Function to save individual field changes  
const handleFieldSave = async (field: string, value: string) => {
    try {
      const updateData: any = { [field]: value };
      
      // Handle date fields
      if (field === 'dueDate' || field === 'WeddingDate') {
        updateData[field] = value ? new Date(value).toISOString() : null;
      }

      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      // Update local state
      setClientData(prev => ({ ...prev, [field]: value }));
      
      // Refresh the page to update all components
      router.refresh();
    } catch (error) {
      console.error('Failed to save field:', error);
      throw error;
    }
  };

  // 3. The UI Layout
  return(
    <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
              {/* Section Title with increased bottom margin */}
              <h3 className="text-3xl font-serif text-slate-900 mb-10 border-b border-slate-50 pb-4">
                Client Information
              </h3>

              {/* Main Grid: 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-5">

                {/* COLUMN 1: Personal Details */}
                <div className="space-y-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Contact Details
                  </h4>
                  <div className="space-y-6">
                    <DetailItem 
                      label="Full Name" 
                      value={clientData.name} 
                      field="name"
                      editable={true}
                      onSave={handleFieldSave}
                    />
                    <DetailItem 
                      label="Phone Number" 
                      value={clientData.phone} 
                      field="phone"
                      editable={true}
                      onSave={handleFieldSave}
                    />
                    <DetailItem 
                      label="Email Address" 
                      value={clientData.email || 'No email provided'} 
                      field="email"
                      type="email"
                      editable={true}
                      onSave={handleFieldSave}
                    />
                  </div>
                </div>

                {/* COLUMN 2: Order/Project Details */}
                <div className="space-y-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Project Timeline
                  </h4>
                  <div className="space-y-6">
                    <DetailItem
                      label="Due Date"
                      value={clientData.dueDate ? new Date(clientData.dueDate).toLocaleDateString("en-GB") : 'N/A'}
                      field="dueDate"
                      type="date"
                      editable={true}
                      onSave={handleFieldSave}
                    />
                    <DetailItem
                      label="Wedding Date"
                      value={clientData.WeddingDate ? new Date(clientData.WeddingDate).toLocaleDateString("en-GB") : 'N/A'}
                      field="WeddingDate"
                      type="date"
                      editable={true}
                      onSave={handleFieldSave}
                    />
                  </div>
                </div>

              </div>
            </div>
  )

}