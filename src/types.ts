// src/types.ts

export interface Measurement {
  id: number;
  clientId: number;
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

export interface Appointment {
  id: number;
  clientId: number;
  date: string; // ISO string
  time: string; // ISO string
  service: string;
  notes: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  WeddingDate: string; // ISO string
  NeedGownBy: string; // ISO string
  Recommended: string;
  notes: string;
  measurements?: Measurement[];
  appointments?: Appointment[];
  createdAt: string;
}
