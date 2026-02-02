// src/types.ts

export interface Expense {
  id: number;
  projectId: number;
  description: string;
  amount: number;
  date: string;
}

export interface Measurement {
  id: number;
  projectId: number; // Linked to Project now, not Client!
  date: string; // ISO string for DateTime
  Bust: number;
  waist: number;
  Hips: number;
  ShirtLength: number;
  SkirtLength: number;
  SleeveLength: number;
  SleeveWidth: number;
  ShoulderToBust: number;
  notes?: string;
}

export interface Project {
  id: number;
  clientId: number;
  memberName: string; // "Sarah", "Mom", etc.
  orderType: 'RENTAL' | 'CUSTOM_MAKE';
  price: number;
  isPickedUp: boolean;
  measurements: Measurement[];
  expenses: Expense[];
}

export interface Payment {
  id: number;
  clientId: number;
  amount: number;
  date: string;
  method: string; // "Cash", "Check", etc.
}

export interface Appointment {
  id: number;
  clientId: number;
  serviceId: number;
  start: string | Date; // Ensure this is here
  end: string | Date;
  date: string | Date;
  status: string;
  notes?: string;
  service?: {         // Ensure the relation is defined
    name: string;
    defaultDurationMin: number;
  };
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  WeddingDate: string; // ISO string
  dueDate?: string; // Standardized to string for JSON safety
  Recommended: string;
  notes: string;

  projects: Project[];  // The Family Gowns
  appointments?: Appointment[];
  payments: Payment[];  // The Family Payment History
  createdAt: string;
}

// This is the "Super Type" we use for the List and Detail pages
export type ClientWithRelations = Client;
