import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";

export const UpdateClientSchema = CreateClientSchema.partial();


//get the client by id
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


//update the client by id
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
      dataToUpdate.WeddingDate = new Date(parsed.data.WeddingDate);
    if (parsed.data.dueDate !== undefined)
      dataToUpdate.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.fabricType !== undefined)
      dataToUpdate.fabricType = parsed.data.fabricType;
    if (parsed.data.price !== undefined)
      dataToUpdate.price = parsed.data.price;
    if (parsed.data.Recommended !== undefined)
      dataToUpdate.Recommended = parsed.data.Recommended;
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
