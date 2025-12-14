// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Load all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { 
        service: true, 
        client: true   
      }
    });
    
    // Format the data so the Calendar understands it
    const formattedEvents = appointments.map((app) => ({
      id: app.id,
      title: app.service.name, 
      start: app.start,
      end: app.end,
      resource: app
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

// 2. POST: Save a new appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, clientId, date, time, duration, notes } = body;

    // --- VALIDATION ---
    if (!clientId) {
      return NextResponse.json({ error: "Client is missing" }, { status: 400 });
    }

    // --- 1. Prepare Dates ---
    const startDateTimeString = `${date}T${time}:00`;
    const start = new Date(startDateTimeString);
    const end = new Date(start.getTime() + duration * 60000);

    // --- 2. Find or Create Service ---
    let serviceRecord = await prisma.service.findFirst({
      where: { name: title }
    });

    if (!serviceRecord) {
      serviceRecord = await prisma.service.create({
        data: {
          name: title,
          defaultDurationMin: duration,
          active: true
        }
      });
    }

    // --- 3. Save Appointment ---
    const newAppointment = await prisma.appointment.create({
      data: {
        date: start,               // <--- ADDED THIS LINE TO FIX THE ERROR!
        start: start,
        end: end,
        durationMinutes: duration,
        notes: notes,
        
        client: { 
            connect: { id: parseInt(clientId) } 
        },

        service: { 
            connect: { id: serviceRecord.id } 
        }
      },
    });

    return NextResponse.json(newAppointment);
  } catch (error) {
    console.error("Failed to save appointment:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}