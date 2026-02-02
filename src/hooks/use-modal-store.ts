import { create } from 'zustand';

export type ModalType = "addClient" | "bookAppointment" | "addPayment" | "addExpense";

interface ModalData {
  clientId?: number;
  clientName?: string; // Helpful for the "For: Name" label
  allClients?: any[];
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type , data}),
  onClose: () => set({ isOpen: false, type: null }),
}));