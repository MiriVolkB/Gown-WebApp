import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";

export const UpdateClientSchema = CreateClientSchema.partial();

//new get - for family style
export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientIdInt },
    include: {
      // Fetch all gowns/people in this family
      projects: {
        include: {
          measurements: { orderBy: { date: "desc" } },
          expenses: true,
        },
      },
      payments: true, // Fetch family payment history
      appointments: {
      include: {
        service: true // <--- THIS IS THE MISSING KEY!
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
  const { clientId } = await params;
  const clientIdInt = Number(clientId);

  if (Number.isNaN(clientIdInt)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  try {
    const data = await req.json();

    // Note: Ensure UpdateClientSchema is updated to reflect new schema names
    const parsed = UpdateClientSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    // --- Using the 'if' style for explicit mapping ---
    if (parsed.data.name !== undefined) dataToUpdate.name = parsed.data.name;
    if (parsed.data.email !== undefined) dataToUpdate.email = parsed.data.email;
    if (parsed.data.phone !== undefined) dataToUpdate.phone = parsed.data.phone;
    
    // Updated to match the new schema names
    if (parsed.data.WeddingDate !== undefined)
      dataToUpdate.weddingDate = parsed.data.WeddingDate ? new Date(parsed.data.WeddingDate) : null;
    
    if (parsed.data.dueDate !== undefined)
      dataToUpdate.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;

    ;
    
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