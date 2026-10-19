import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { measurementSchema } from "@/lib/validation/measurement";
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
