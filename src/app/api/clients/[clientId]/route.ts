import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";
import { getUser } from "@/lib/getUser";

export const UpdateClientSchema = CreateClientSchema.partial();

//new get - for family style
export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
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
          service: true
        }
      }
    },
  });

  if (!client) {
    return NextResponse.json(
      { error: "Client not found" },
      { status: 404 });
  }

  return NextResponse.json(client);
}




export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }

  const { clientId } = await params;
  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  try {
    const owned = await prisma.client.findFirst({
      where: { id: clientIdInt, ownerId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const data = await req.json();

    const parsed = UpdateClientSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (parsed.data.name !== undefined) dataToUpdate.name = parsed.data.name;
    if (parsed.data.email !== undefined) dataToUpdate.email = parsed.data.email;
    if (parsed.data.phone !== undefined) dataToUpdate.phone = parsed.data.phone;

    if (parsed.data.WeddingDate !== undefined)
      dataToUpdate.WeddingDate = parsed.data.WeddingDate ? new Date(parsed.data.WeddingDate) : null;

    if (parsed.data.dueDate !== undefined)
      dataToUpdate.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;

    if (parsed.data.notes !== undefined)
      dataToUpdate.notes = parsed.data.notes;

    const updatedClient = await prisma.client.update({
      where: { id: clientIdInt },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedClient);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}