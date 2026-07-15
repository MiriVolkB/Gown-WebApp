import { Prisma, Measurement } from "@prisma/client";

// 1. The Main Client Profile Data Type (Replaces your manual Client/ClientWithRelations)
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

export type ClientListItem = Prisma.ClientGetPayload<{
  include: {
    projects: {
      include: {
        expenses: true;
      };
    };
    payments: true;
    appointments: true; // 🗓️ Added this so the main page can compute the next appointment
  };
}>;

// 2. Sub-Types (These replace your manual Project and Appointment interfaces)
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    measurements: true;
    expenses: true;
  }
}>;

export type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: { service: true }
}>;

export type BookingType = "client" | "custom";

export interface AppointmentSavePayload {
  id?: number;
  bookingType: BookingType;
  clientName?: string;
  clientId?: number | null;
  clientPhone?: string;
  eventTitle?: string;
  serviceName: string;
  start: Date | string;
  end: Date | string;
  notes?: string;
}

// 3. Keep the Page Props here so it's easy to import into ClientProfilePage.tsx
export interface ClientProfilePageProps {
  client: ClientProfileData;
  appointments: ClientProfileData["appointments"];
  onBack?: () => void;
}

// 4. Exporting standard Prisma types for easy use in modals/forms
export type PrismaMeasurement = Measurement;