import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UpdateClientSchema } from "@/lib/validation/client.schema";
import { getUser } from "@/lib/getUser";

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

    const body = await req.json();
    const parsed = UpdateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const val = parsed.data;
    const data: Prisma.ClientUpdateInput = {};

    if (val.name !== undefined) data.name = val.name;
    if (val.phone !== undefined) data.phone = val.phone;
    if (val.email !== undefined) data.email = val.email || null;
    if (val.notes !== undefined) data.notes = val.notes;
    if (val.Recommended !== undefined) data.Recommended = val.Recommended;
    if (val.WeddingDate !== undefined) {
      data.WeddingDate = val.WeddingDate ? new Date(val.WeddingDate) : null;
    }
    if (val.dueDate !== undefined) {
      data.dueDate = val.dueDate ? new Date(val.dueDate) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientIdInt },
      data,
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

export async function DELETE(
  _req: Request,
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

  try {
    await prisma.$transaction(
      async (tx) => {
        // Only proceed if this client belongs to the logged-in user
        const owned = await tx.client.findFirst({
          where: { id: clientIdInt, ownerId: user.id },
          select: {
            id: true,
            projects: { select: { id: true } },
          },
        });
        if (!owned) {
          throw new Error("NOT_FOUND");
        }

        const projectIds = owned.projects.map((p) => p.id);

        if (projectIds.length > 0) {
          await tx.measurement.deleteMany({
            where: { projectId: { in: projectIds } },
          });
          await tx.expense.deleteMany({
            where: { projectId: { in: projectIds } },
          });
          await tx.project.deleteMany({
            where: { clientId: clientIdInt },
          });
        }

        await tx.payment.deleteMany({ where: { clientId: clientIdInt } });
        await tx.appointment.deleteMany({ where: { clientId: clientIdInt } });

        // Final delete still scoped to owner — blocks deleting another user's client
        const deleted = await tx.client.deleteMany({
          where: { id: clientIdInt, ownerId: user.id },
        });
        if (deleted.count === 0) {
          throw new Error("NOT_FOUND");
        }
      },
      {
        // Remote DB round-trips can exceed Prisma's default 5s interactive timeout
        maxWait: 10_000,
        timeout: 30_000,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
