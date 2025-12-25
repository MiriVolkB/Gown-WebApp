import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        service: true,
      },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. FIX CLIENT ID: Convert string "12" to number 12
    const clientIdInt = parseInt(body.clientId);
    if (isNaN(clientIdInt)) {
        return NextResponse.json({ error: 'Invalid Client ID' }, { status: 400 });
    }

    // 2. FIX SERVICE: The frontend sends a name (body.title), but we need an ID.
    // We will try to find a service with that name. If it doesn't exist, we CREATE it.
    let service = await prisma.service.findFirst({
        where: { name: body.title }
    });

    // If the service (e.g. "First Fitting") doesn't exist yet, create it now!
    if (!service) {
        service = await prisma.service.create({
            data: {
                name: body.title,
                defaultDurationMin: body.duration || 30,
                color: '#3b82f6' // Default blue
            }
        });
    }

    // 3. COMBINE DATE & TIME
    // Frontend sends date="2025-12-25" and time="14:30"
    // We need to combine them into a single DateTime object
    const startDateTime = new Date(`${body.date}T${body.time}:00`);
    
    // Calculate End Time based on duration
    const duration = body.duration || 60;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // 4. SAVE TO DATABASE
    const newAppointment = await prisma.appointment.create({
      data: {
        start: startDateTime,
        end: endDateTime,
        clientId: clientIdInt,
        serviceId: service.id, // Use the ID we found or created
        date: startDateTime,   // Keep redundancy if your schema requires it
        durationMinutes: duration,
        notes: body.notes,
        status: 'SCHEDULED'
      },
    });

    return NextResponse.json(newAppointment);
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: 'Error saving appointment' }, { status: 500 });
  }
}