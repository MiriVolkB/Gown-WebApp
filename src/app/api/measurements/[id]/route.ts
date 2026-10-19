import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMeasurementSchema } from "@/lib/validation/measurement";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

// Returns the measurement id only if it belongs to one of this user's clients.
async function findOwnedMeasurement(rawId: string, ownerId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const owned = await prisma.measurement.findFirst({
    where: { id, project: { client: { ownerId } } },
    select: { id: true },
  });
  return owned?.id ?? null;
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "saveMeasurement")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const parsed = updateMeasurementSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const id = await findOwnedMeasurement(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    }

    const updated = await prisma.measurement.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update measurement" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "deleteMeasurement")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const id = await findOwnedMeasurement(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    }

    await prisma.measurement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
  }
}
