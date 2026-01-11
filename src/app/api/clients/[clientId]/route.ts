import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  // ✅ unwrap params FIRST
  const { clientId } = await params;

  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    return NextResponse.json(
      { error: "Invalid client ID" },
      { status: 400 }
    );
  }

  const client = await prisma.client.findUnique({
    where: { id: clientIdInt }, // ✅ number
    include: {
      measurements: { orderBy: { date: "desc" } },
      appointments: true,
    },
  });

  if (!client) {
    return NextResponse.json(
      { error: "Client not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(client);
}
