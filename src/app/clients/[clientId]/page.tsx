import { notFound } from "next/navigation";
import { ClientProfilePage } from "@/components/ClientProfilePage";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";
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

  const user = await getUser();
  if (!user) notFound();

  // Only open clients that belong to the logged-in user
  const clientData = await prisma.client.findFirst({
    where: { id: clientIdInt, ownerId: user.id },
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
  // Guests see the button too: their delete is a simulated success.
  const canDeletePayment = user.role === "GUEST" || isAllowed(user.role, "deletePayment");
  const canDeleteExpense = user.role === "GUEST" || isAllowed(user.role, "deleteExpense");

  return (
    <ClientProfilePage
      client={clientData}
      appointments={appointments}
      canDeletePayment={canDeletePayment}
      canDeleteExpense={canDeleteExpense}
    />
  );
}