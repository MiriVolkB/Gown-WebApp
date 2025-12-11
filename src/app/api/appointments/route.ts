import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure this path matches your project structure

// GET: Fetch all appointments for the calendar
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: "asc" },
      include: {
        client: true,   // Include client details (name, etc.)
        service: true,  // Include service details (color, name)
      },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error("[GET /api/appointments]", err);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST: Create a new appointment
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // CRITICAL FIX: Convert string dates from frontend to real Date objects
    const newAppointment = await prisma.appointment.create({
      data: {
        clientId: body.clientId,
        serviceId: body.serviceId,
        start: new Date(body.start), // Convert "2025-11-12..." to Date
        end: new Date(body.end),     // Convert "2025-11-12..." to Date
        durationMinutes: body.durationMinutes,
        notes: body.notes,
        status: body.status || "SCHEDULED",
      },
    });

    return NextResponse.json(newAppointment);
  } catch (err) {
    console.error("[POST /api/appointments]", err);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}