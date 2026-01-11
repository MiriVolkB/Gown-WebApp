import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { measurementSchema } from "@/lib/validation/measurement";
import { updateMeasurementSchema } from "@/lib/validation/measurement";


export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = measurementSchema.parse(json); // 🔥 validation here

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
  try {
    const id = Number(params.id);
    await prisma.measurement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
  }
}

