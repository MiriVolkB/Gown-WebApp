"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal-store";
import { AddClientModal } from "@/components/AddClientModal";
import AppointmentModal from "@/components/AppointmentModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import AddExpenseModal from "@/components/AddExpenseModal"; // Check this path matches your file!

export const ModalProvider = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['clients-picker'],
      staleTime: 5 * 60_000,
      queryFn: async () => {
        const res = await fetch('/api/clients?fields=picker');
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      },
    });
  }, [queryClient]);

  useEffect(() => {
    if (type === "addExpense" ) {
      fetch("/api/clients")
        .then(res => res.json())
        .then(clients => {
          const allProjects = clients.flatMap((client: any) =>
            (client.projects || []).map((p: any) => ({
              ...p,
              clientName: client.name
            }))
          );
          setProjects(allProjects);
        });
    }
  }, [type]);

  // If the store says no modal is open, we render nothing
  if (!isOpen || !type) return null;

  const { clientId, allClients } = data || {};

  return (
    <>
      {type === "addClient" && <AddClientModal onClose={onClose} />}
      {type === "bookAppointment" && (
        <AppointmentModal 
          isOpen={true} 
          onClose={onClose} 
          selectedDate={new Date()} 
          selectedTime={null}
          initialData={data?.initialData} // <--- JUST ADD THIS ONE LINE HERE
          onSave={async (appointmentData) => {
            // ONLY do the fetching here. Don't close or refresh!
            const response = await fetch('/api/appointments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("Server Error Details:", errorText);
              throw new Error("Server failed to respond correctly");
            }
            return response.json();
          }} 
        />
      )}
      {type === "addPayment" && (
        <AddPaymentModal 
           clientId={data?.clientId} 
           allClients={data?.allClients || []}
           onClose={onClose} 
           onSave={() => {
             onClose();
             router.refresh();
           }} 
        />
      )}
      {type === "addExpense" && (
        <AddExpenseModal 
          projects={projects}
          onClose={onClose}
        />
      )}
    </>
  );
};