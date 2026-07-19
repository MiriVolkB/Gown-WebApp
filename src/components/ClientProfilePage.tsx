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
import { DeleteClientModal } from "@/components/DeleteClientModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import AddExpenseModal from "./AddExpenseModal";

// Actions & Types
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { ClientProfilePageProps } from "../types";

import { useModal } from "@/hooks/use-modal-store";

const deepNavy = "#1E2024";
const lightGrayBackground = "#F7F7F7";

export function ClientProfilePage({
  client,
  appointments,
  onBack,
}: ClientProfilePageProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { onOpen } = useModal();

  const handleCancelAppointment = async (appointmentId: number) => {
    const response = await cancelAppointmentAction(appointmentId);
    if (response.ok) router.refresh();
  };

  return (
    // 1. FIXED PADDING: p-4 on mobile, md:p-8 on desktop
    <div className="min-h-screen p-4 sm:p-6 md:p-8" style={{ backgroundColor: lightGrayBackground }}>
      <div className="max-w-7xl mx-auto">

        <Button variant="ghost" onClick={() => {
          if (onBack) {
            onBack();
          } else {
            router.push('/clients');
          }
        }} className="mb-6 md:mb-8 p-0" style={{ color: deepNavy }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>

        <ClientHeader
          client={client}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
        />

        <Tabs defaultValue="information" className="w-full">
          {/* 2. FIXED TABS: Now swipable on mobile instead of stacking tall */}
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 mb-6 flex w-full justify-start overflow-x-auto sm:flex-wrap h-auto snap-x hide-scrollbar">
            
            <TabsTrigger 
              className="data-[state=inactive]:hover:bg-slate-200 transition-all snap-start whitespace-nowrap" 
              value="information"
            >
              Information
            </TabsTrigger>
            
            <TabsTrigger 
              className="data-[state=inactive]:hover:bg-slate-200 transition-all snap-start whitespace-nowrap" 
              value="overview"
            >
              Overview & Billing
            </TabsTrigger>
            
            <TabsTrigger 
              className="data-[state=inactive]:hover:bg-slate-200 transition-all snap-start whitespace-nowrap" 
              value="appointments"
            >
              Appointments
            </TabsTrigger>

            {client.projects.map((project) => (
              <TabsTrigger 
                className="data-[state=inactive]:hover:bg-slate-200 transition-all snap-start whitespace-nowrap" 
                key={project.id} 
                value={`gown-${project.id}`}
              >
                {project.memberName}'s Gown
              </TabsTrigger>
            ))}

            <Button variant="ghost" size="sm" className="ml-2 text-blue-600 shrink-0 hover:bg-blue-50 transition-colors"
              onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Member
            </Button>
          </TabsList>

          <TabsContent value="information">
            <InformationTab client={client} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              client={client}
              onAddExpense={() => {
                setSelectedProjectId(null); 
                setIsExpenseModalOpen(true);
              }}
            />
          </TabsContent>
          
          {client.projects.map((project) => (
            <TabsContent key={project.id} value={`gown-${project.id}`}>
              {/* 3. FIXED CARD PADDING: p-4 on mobile, p-8 on desktop */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm space-y-10">
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

          <TabsContent value="notes">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-medium mb-4" style={{ color: deepNavy }}>General Notes</h3>
              <div className="whitespace-pre-wrap text-gray-700">{client.notes || 'No general notes recorded for this client.'}</div>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            {/* 3. FIXED CARD PADDING: p-5 on mobile, p-10 on desktop */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 md:p-10 shadow-sm">
              <h3 className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 md:mb-10 border-b border-slate-50 pb-4">
                Appointments
              </h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <AppointmentList
                  appointments={appointments}
                  onEdit={(apt) => {
                    onOpen("bookAppointment", {
                      initialData: {
                        id: apt.id,                 
                        title: client.name,         
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
              setSelectedProjectId(null); 
            }}
          />
        )}

        {isEditOpen && (
          <EditClientModal
            client={client}
            onClose={() => setIsEditOpen(false)}
            onSave={() => router.refresh()} 
          />
        )}

        {isDeleteOpen && (
          <DeleteClientModal
            clientId={client.id}
            clientName={client.name}
            onClose={() => setIsDeleteOpen(false)}
          />
        )}
      </div>

      {isAddMemberOpen && (
        <AddMemberModal
          clientId={client.id}
          onClose={() => setIsAddMemberOpen(false)}
          onSave={() => {
            setIsAddMemberOpen(false);
            router.refresh(); 
          }}
        />
      )}

      {isExpenseModalOpen && (
        <AddExpenseModal
          projects={client.projects}
          initialProjectId={selectedProjectId ?? undefined}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setSelectedProjectId(null); 
          }}
        />
      )}
    </div>
  );
}