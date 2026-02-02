"use client";
import { useState } from "react";

import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { format, isValid } from 'date-fns';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Appointment, Measurement } from '../types'; // Import Measurement
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AddMeasurementModal } from "@/components/AddMeasurementModal";
import { EditClientModal } from "@/components/EditClientModal";
import { calculateFamilyFinances } from '../lib/calculations';
import { ClientWithRelations } from "../types";
import { AddMemberModal } from "@/components/AddMemberModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import { FamilyInvoiceBreakdown } from "@/components/FamilyInvoiceBreakdown";
import { FamilyFinancialSummary } from "@/components/client-profile/FamilyFinancialSummary";
import AppointmentModal from "@/components/AppointmentModal";
import AddExpenseModal from "./AddExpenseModal";
import { SingleMeasurementDisplay } from "@/components/measurements/SingleMeasurementDisplay";
import { AppointmentList } from "./client-profile/AppointmentList";
import { saveAppointmentAction, cancelAppointmentAction } from '@/lib/actions/appointments';




interface ClientProfilePageProps {
  client: ClientWithRelations; // Use the one that includes projects/payments
  appointments: Appointment[];
  onBack?: () => void;
  onNewAppointment?: () => void;

}

// Define the Deep Navy color value
const deepNavy = '#1E2024';
const lightGrayBackground = '#F7F7F7';

// Helper component for displaying data field pairs
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-sm mb-1" style={{ color: 'gray' }}>{label}</div>
    <div className="font-medium" style={{ color: deepNavy }}>{value}</div>
  </div>
);







export function ClientProfilePage({
  client,
  appointments,
  onBack,
  onNewAppointment,

}: ClientProfilePageProps) {
  const router = useRouter();

  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false); 
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const clientAppointments = appointments.filter((apt) => apt.clientId === client.id);
  
  // Inside your Clients Component

const [selectedClientForPayment, setSelectedClientForPayment] = useState<any>(null);

// Call this from your "Global" Add Payment button
const openGlobalPayment = () => {
  setSelectedClientForPayment(null); // Reset so the modal shows the search bar
  setIsPaymentOpen(true);
};

// Call this from a specific Client's row/card
const openSpecificPayment = (client: any) => {
  setSelectedClientForPayment(client); // Pre-set the client so it skips search
  setIsPaymentOpen(true);
};
  
  const handleEditClient = () => {
    router.push(`/clients/${client.id}/edit`);
  };

  const handleNewAppointment = () => {
    router.push(`/appointments/new?clientId=${client.id}`);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure?")) return;

    const response = await cancelAppointmentAction(appointmentId);
    if (response.ok) router.refresh();
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    const response = await saveAppointmentAction(appointmentData, client.id, client.name);

    if (response.ok) {
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null); // Good to keep this here to reset the state
      router.refresh();
    } else {
      alert("Something went wrong saving the appointment.");
    }
  };

  const handleSaveField = async (field: keyof Measurement, value: number | string) => {
    if (!editingMeasurement) return;

    await fetch(`/api/measurements/${editingMeasurement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: Number(value) }),
    });

    router.refresh();
  };

  // Added this so the "Add Member" button doesn't crash
  const handleAddGown = () => {
    router.push(`/clients/${client.id}/add-member`);
  };

  const handleDeleteMeasurement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this measurement?")) return;

    try {
      await fetch(`/api/measurements/${id}`, { method: "DELETE" });
      // Refresh measurements (or reload)
      router.refresh(); // Next.js 13+ recommended
    } catch (error) {
      console.error("Failed to delete measurement", error);
    }
  };

  // Assuming the latest measurement is the first one in the array
  //const latestMeasurement = client.measurements?.[0];

  return (
    // Apply the light gray background to the container
    <div className="min-h-screen p-8" style={{ backgroundColor: lightGrayBackground }}>
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <Button variant="ghost" onClick={() => {
          if (onBack) {
            onBack();
          } else {
            router.push('/clients');
          }
        }} className="mb-8 p-0" style={{ color: deepNavy }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>

        {/* Client Header/Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div>
              {/* Elegant Font (Playfair Display/Serif) and Deep Navy color */}
              <h2
                className="text-4xl font-light mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: deepNavy }}
              >
                {client.name}
              </h2>
              <p className="text-gray-500 mb-4">{client.email} | {client.phone}</p>
            </div>
            <div className="flex gap-3">
              {/* Edit Button - Styled to match the theme (outline) */}
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(true)}
                className="text-sm border-gray-300 hover:bg-gray-50"
                style={{ color: deepNavy }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              {/* Book Appointment Button - Deep Navy background, white text */}
              <Button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="text-sm shadow-md transition hover:bg-opacity-90"
                style={{ backgroundColor: deepNavy, color: 'white' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>




        {/* Tabs Navigation */}
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 mb-6 flex-wrap h-auto">
            {/* Family Level Tabs */}
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="overview">Overview & Billing</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>

            {/* Individual Gown Tabs */}
            {client.projects.map((project) => (


              <TabsTrigger key={project.id} value={`gown-${project.id}`}>
                {project.memberName}'s Gown
              </TabsTrigger>

            ))}

            {/* Add Member Button */}
            <Button variant="ghost" size="sm" className="ml-2 text-blue-600"
              onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Member
            </Button>
          </TabsList>




          {/* 1. INFORMATION Tab */}
          <TabsContent value="information">
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
                    <DetailItem label="Full Name" value={client.name} />
                    <DetailItem label="Phone Number" value={client.phone} />
                    <DetailItem label="Email Address" value={client.email || 'No email provided'} />
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
                      value={client.dueDate ? new Date(client.dueDate).toLocaleDateString("en-GB") : 'N/A'}
                    />
                    <DetailItem
                      label="Wedding Date"
                      value={client.WeddingDate ? new Date(client.WeddingDate).toLocaleDateString("en-GB") : 'N/A'}
                    />
                  </div>
                </div>

              </div>
            </div>
          </TabsContent>


          {/* 1. OVERVIEW Tab (Financials + Family Info) */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Summary Cards stay as they are for quick glance */}
            <FamilyFinancialSummary client={client} />

            {/* NEW: Unified Family Folder Container */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Folder Header */}
              <div className="bg-slate-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Billing & Activity</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Family Expense
                  </Button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                  {/* LEFT & CENTER: The Money Flow (2 columns) */}
                  <div className="lg:col-span-2 space-y-10">

                    {/* Section 1: Detailed Breakdown */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 w-1 bg-blue-600 rounded-full" />
                        <h3 className="font-bold text-slate-800">Order Details</h3>
                      </div>
                      <FamilyInvoiceBreakdown client={client} />
                    </section>

                    {/* Section 2: Payment History */}
                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-emerald-600 rounded-full" />
                          <h3 className="font-bold text-slate-800">Payment Records</h3>
                        </div>
                        <Button
                          onClick={() => setIsPaymentOpen(true)}
                          variant="outline"
                          size="sm"
                          className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Record Payment
                        </Button>
                      </div>

                      {client?.payments && client.payments.length > 0 ? (
                        <div className="bg-slate-50/50 rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-slate-100/50">
                              <tr className="text-[10px] font-bold uppercase text-slate-400">
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {client.payments.map((payment) => (
                                <tr key={payment.id}>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(payment.date).toLocaleDateString("en-GB")}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className="text-slate-500 font-medium uppercase text-[10px] tracking-tight">
                                      {payment.method?.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
                                    {payment.amount.toLocaleString()} NIS
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl border border-dashed border-gray-200 py-6 text-center">
                          <p className="text-slate-400 text-sm italic">No payments recorded yet.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* RIGHT SIDE: Sidebar (1 column) */}
                  <div className="space-y-8">
                    {/* Notes Card inside the main container */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-6">
                      <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        Family Notes
                      </h3>
                      <p className="text-sm text-amber-800/80 leading-relaxed italic">
                        {client.notes || "No special instructions for this family."}
                      </p>
                    </div>

                    {/* Quick Stats or Contact Info can go here too */}
                    <div className="px-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Client Contact</h4>
                      <p className="text-sm font-medium text-slate-700">{client.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">{client.email || "No email provided"}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </TabsContent>


          {/* 2. GOWN Tabs (Dynamic) */}
          {client.projects.map((project) => (
            <TabsContent key={project.id} value={`gown-${project.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-10">

                {/* SECTION 1: MAIN GOWN HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif text-slate-900">
                      {project.memberName}'s Gown
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                      Type: {project.orderType === 'RENTAL' ? 'Rental' : 'Custom Design'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setIsExpenseModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Expense
                    </Button>


                    <Button
                      style={{ backgroundColor: deepNavy, color: 'white' }}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setIsMeasurementOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Measurement
                    </Button>
                  </div>
                </div>

                {/* SECTION 2: UNIFIED MEASUREMENTS LIST */}
                <section className="space-y-12">
                  {project.measurements && project.measurements.length > 0 ? (
                    project.measurements.map((measurement) => (
                      <div key={measurement.id} className="space-y-4">

                        {/* Individual Fitting Header */}
                        <div className="flex items-baseline justify-between">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-serif text-slate-800">Measurements</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                              <span className="h-1 w-1 bg-blue-400 rounded-full" />
                              Last Fit: {new Date(measurement.date).toLocaleDateString("en-GB")}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-200">                              Final Fitting
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50 h-8 px-3"
                                onClick={() => {
                                  setSelectedProjectId(project.id);
                                  setEditingMeasurement(measurement);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:bg-rose-50 h-8 px-3"
                                onClick={() => handleDeleteMeasurement(measurement.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* The Display Component with the slim lines */}
                        <SingleMeasurementDisplay measurement={measurement} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-400 italic text-sm">No measurements recorded yet.</p>
                    </div>
                  )}
                </section>

                {/* SECTION 3: ITEMIZED EXPENSES BREAKDOWN */}
                <section className="pt-10 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Gown Expense Breakdown</h4>
                      <p className="text-xs text-slate-400">Additional costs outside the base price</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Extras</p>
                      <p className="text-xl font-serif text-slate-900">
                        {project.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString()} <span className="text-xs">NIS</span>
                      </p>
                    </div>
                  </div>

                  {project.expenses && project.expenses.length > 0 ? (
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100/50">
                          <tr className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                            <th className="px-8 py-4">Expense Description</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {project.expenses.map((exp: any) => (
                            <tr key={exp.id} className="hover:bg-white transition-colors">
                              <td className="px-8 py-4 font-medium text-slate-700">
                                {exp.type}
                              </td>
                              <td className="px-8 py-4 text-right font-serif font-bold text-slate-900">
                                {exp.amount.toLocaleString()} NIS
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-xs italic">No additional expenses recorded for this gown.</p>
                    </div>
                  )}
                </section>
              </div>
            </TabsContent>
          ))}

          {/* 3. NOTES Tab */}
          <TabsContent value="notes">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-medium mb-4" style={{ color: deepNavy }}>General Notes</h3>
              <div className="whitespace-pre-wrap text-gray-700">{client.notes || 'No general notes recorded for this client.'}</div>
            </div>
          </TabsContent>
          {/* 4. APPOINTMENTS Tab */}
          <TabsContent value="appointments">
            <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">

              {/* Section Title with the same style as Information */}
              <h3 className="text-3xl font-serif text-slate-900 mb-10 border-b border-slate-50 pb-4">
                Appointments
              </h3>

              {/* The List Container */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <AppointmentList
                  appointments={clientAppointments}
                  onEdit={setEditingAppointment}
                  onCancel={handleCancelAppointment}
                />
              </div>

            </div>
          </TabsContent>
        </Tabs>


        {/* --- Modals Section --- */}


{isPaymentOpen && (
        <AddPaymentModal 
          clientId={client.id} // Passing the ID locks the modal to this client
          allClients={[]} // Not needed when clientId is present
          onClose={() => setIsPaymentOpen(false)} 
          onSave={() => window.location.reload()} 
        />
      )}

        {isMeasurementOpen && selectedProjectId && (
          <AddMeasurementModal
            projectId={selectedProjectId}
            onClose={() => {
              setIsMeasurementOpen(false);
              setSelectedProjectId(null); // Always clean up after closing
            }}
          />
        )}

        {isEditOpen && (
          <EditClientModal
            client={client}
            onClose={() => setIsEditOpen(false)}
            onSave={() => router.refresh()} // refresh the page to show updated info
          />
        )}
      </div>
{/* --- Add Member Modal --- */}
{isAddMemberOpen && (
  <AddMemberModal
    clientId={client.id}
    onClose={() => setIsAddMemberOpen(false)}
    onSave={() => {
      setIsAddMemberOpen(false);
      router.refresh(); // This updates the tabs so the new daughter appears!
    }}
  />
)}
      {/* --- Global Expense Modal --- */}
      {isExpenseModalOpen && (
        <AddExpenseModal
          projects={client.projects}
          initialProjectId={selectedProjectId ?? undefined}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setSelectedProjectId(null); // Reset when closing
          }}
        />
      )}

      {/* --- The Combined Appointment Modal --- */}
      {(isAppointmentModalOpen || editingAppointment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <AppointmentModal
              isOpen={!!(isAppointmentModalOpen || editingAppointment)}
              onClose={() => {
                setIsAppointmentModalOpen(false);
                setEditingAppointment(null); // Clear the edit state when closing
              }}
              selectedDate={new Date()}
              selectedTime="10:00"
              onSave={handleSaveAppointment}
              // If editingAppointment has data, the form will auto-fill!
              initialData={editingAppointment ? {
                id: editingAppointment.id,
                title: client.name,
                start: editingAppointment.start || editingAppointment.date,
                end: editingAppointment.end,
                resource: {
                  notes: editingAppointment.notes,
                  service: { name: editingAppointment.service?.name }
                }
              } : null}
            />
          </div>
        </div>
      )}
    </div>
  );
}