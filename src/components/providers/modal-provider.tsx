"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/hooks/use-modal-store";
import { AddClientModal } from "@/components/AddClientModal";
import AppointmentModal from "@/components/AppointmentModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import AddExpenseModal from "@/components/AddExpenseModal"; // Check this path matches your file!

export const ModalProvider = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (type === "addExpense" && projects.length === 0) {
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
          onSave={() => {
            onClose();
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
             window.location.reload(); 
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