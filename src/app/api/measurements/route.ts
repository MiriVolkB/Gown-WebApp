import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { measurementSchema } from "@/lib/validation/measurement";
import { updateMeasurementSchema } from "@/lib/validation/measurement";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";


export async function POST(req: Request) {
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
    const json = await req.json();
    const data = measurementSchema.parse(json); // 🔥 validation here

    const owned = await prisma.project.findFirst({
      where: { id: data.projectId, client: { ownerId: user.id } },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Gown order not found" }, { status: 404 });
    }

    const measurement = await prisma.measurement.create({
      data,
    });

    return NextResponse.json(measurement);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create measurement" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
    const body = await req.json();

const parsed = updateMeasurementSchema.safeParse(await req.json() as unknown);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, ...rest } = parsed.data;

    const owned = await prisma.measurement.findFirst({
      where: { id, project: { client: { ownerId: user.id } } },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    }

    const updated = await prisma.measurement.update({
      where: { id },
      data: rest,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update measurement" },
      { status: 500 }
    );
  }
}



export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
    const id = Number(params.id);

    const owned = await prisma.measurement.findFirst({
      where: { id, project: { client: { ownerId: user.id } } },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    }
    await prisma.measurement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
  }
}

