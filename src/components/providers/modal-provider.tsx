"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/hooks/use-modal-store";
import { AddClientModal } from "@/components/AddClientModal";
import AppointmentModal from "@/components/AppointmentModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import AddExpenseModal from "@/components/AddExpenseModal"; // Check this path matches your file!

export const ModalProvider = () => {
  const { isOpen, onClose, type, data } = useModal();

  

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
            // This is a global save, you can add router.refresh() here if needed
            onClose();
          }} 
        />
      )}

      {type === "addPayment" && (
        // Note: For a global header button, we might not have a clientId yet.
        // We'll handle selecting a client inside the modal later!
        <AddPaymentModal 
           clientId={data?.clientId} 
           allClients={data?.allClients || []}
           onClose={onClose} 
           onSave={() => {
             onClose();
             // Optional: trigger a page refresh
             window.location.reload(); 
           }} 
        />
      )}
    </>
  );
};