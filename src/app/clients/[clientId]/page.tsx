import { notFound } from "next/navigation";
import { ClientProfilePage } from "@/components/ClientProfilePage";
import { Client, Appointment } from "@/types";

export default async function ClientProfileRoute({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  // ✅ MUST unwrap params FIRST
  const { clientId } = await params;

  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    notFound();
  }

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${BASE_URL}/api/clients/${clientIdInt}`, {
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Failed to fetch client: ${res.status}`);
  }

  const clientData: Client = await res.json();
  const appointments: Appointment[] = clientData.appointments ?? [];

  return (
    <ClientProfilePage
      client={clientData}
      appointments={appointments}
    />
  );
}
