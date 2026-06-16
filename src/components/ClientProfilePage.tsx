"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, } from 'lucide-react';

// UI Components
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Extracted Child Components
import { ClientHeader } from "@/components/client-profile/ClientHeader";
import { InformationTab } from "@/components/client-profile/InformationTab";
import { OverviewTab } from "@/components/client-profile/OverviewTab";
import { GownTab } from "@/components/client-profile/GownTab";
import { AppointmentList } from "./client-profile/AppointmentList";

// Modals
import { AddMeasurementModal } from "@/components/AddMeasurementModal";
import { EditClientModal } from "@/components/EditClientModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import AddExpenseModal from "./AddExpenseModal";

// Actions & Types
import { saveAppointmentAction, cancelAppointmentAction } from "@/lib/actions/appointments";
import { ClientProfileData, ClientProfilePageProps } from "../types";

import { useModal } from "@/hooks/use-modal-store";

const deepNavy = "#1E2024";
const lightGrayBackground = "#F7F7F7";

export function ClientProfilePage({
  client,
  appointments,
  onBack,
}: ClientProfilePageProps) {
  const router = useRouter();

  // 1. Core Modal Visibility State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);

  // 2. Core Selection State (Tells the modals WHICH item to edit/add to)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { onOpen } = useModal();

  // 3. Appointment API Actions
  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure?")) return;
    const response = await cancelAppointmentAction(appointmentId);
    if (response.ok) router.refresh();
  };

  

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
        {/* 1. Extracted Header */}
        <ClientHeader
          client={client}
          onEdit={() => setIsEditOpen(true)}
        />

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
            <InformationTab client={client} />
          </TabsContent>

          {/* 1. OVERVIEW Tab (Financials + Family Info) */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              client={client}
              onAddExpense={() => {
                setSelectedProjectId(null); // Global family expense
                setIsExpenseModalOpen(true);
              }}
              // I DELETED THE onAddPayment LINE HERE!
            />
          </TabsContent>
          

          {/* 2. GOWN Tabs (Dynamic) */}
          {client.projects.map((project) => (
            <TabsContent key={project.id} value={`gown-${project.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-10">
                <GownTab
                  project={project}
                  onAddMeasurement={() => {
                    setSelectedProjectId(project.id);
                    setIsMeasurementOpen(true);
                  }}
                  onAddExpense={() => {
                    setSelectedProjectId(project.id);
                    setIsExpenseModalOpen(true);
                  }}
                />
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
              <h3 className="text-3xl font-serif text-slate-900 mb-10 border-b border-slate-50 pb-4">
                Appointments
              </h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <AppointmentList
                  appointments={appointments}
                  onEdit={(apt) => {
                    onOpen("bookAppointment", {
                      initialData: {
                        id: apt.id,                 
                        title: client.name,         // Keeps the client name locked in
                        start: apt.start || apt.date, 
                        end: apt.end,
                        resource: {
                          clientId: client.id,
                          notes: apt.notes,
                          service: { name: apt.service?.name || (apt as any).serviceName }
                        }
                      }
                    });
                  }}
                  onCancel={handleCancelAppointment}
                />
              </div>
            </div>

          </TabsContent>
        </Tabs>

        {/* --- Modals Section --- */}

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

    
    </div>
  );
}
