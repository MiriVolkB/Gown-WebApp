import { notFound } from "next/navigation";
import { ClientProfilePage } from "@/components/ClientProfilePage";
import { prisma } from "@/lib/prisma";
import {
  ClientProfileData,
  AppointmentWithService,
} from "@/types";

export default async function ClientProfileRoute({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    notFound();
  }

  // Directly fetch from DB
  const clientData = await prisma.client.findUnique({
    where: { id: clientIdInt },
    include: {
      projects: {
        include: {
          measurements: { orderBy: { date: "desc" } },
          expenses: true,
        },
      },
      payments: true,
      appointments: {
        include: {
          service: true,
        },
      },
    },
  });

  // Handle null safely
  if (!clientData) notFound();

  // TypeScript now knows clientData is not null
  const appointments: AppointmentWithService[] = clientData.appointments ?? [];

  // ✅ Return JSX properly
  return <ClientProfilePage client={clientData} appointments={appointments} />;
}