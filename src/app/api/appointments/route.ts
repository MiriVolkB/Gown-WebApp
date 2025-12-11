import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: "asc" },
      include: {
        client: true,
        service: true,
      },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error("[GET /api/appointments]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: Create appointment with Date Fix
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newAppointment = await prisma.appointment.create({
      data: {
        clientId: body.clientId,
        serviceId: body.serviceId,
        start: new Date(body.start), // Convert String to Date
        end: new Date(body.end),     // Convert String to Date
        durationMinutes: body.durationMinutes,
        notes: body.notes,
        status: body.status || "SCHEDULED",
      },
    });

    return NextResponse.json(newAppointment);
  } catch (err) {
    console.error("[POST /api/appointments]", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}