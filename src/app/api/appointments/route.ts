import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all appointments
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
    return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
  }
}

// POST: Create OR Update Appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- 1. HANDLE CLIENT ---
    let finalClientId = body.clientId ? Number(body.clientId) : null;

    // If we have no ID but we have a Name, try to find the existing client
    if (!finalClientId && body.clientName) {
        const existingClient = await prisma.client.findFirst({
            where: { 
                name: {
                    equals: body.clientName,
                    mode: 'insensitive' // Ignores case (finds "miri" even if "Miri")
                }
            }
        });

        if (existingClient) {
            finalClientId = existingClient.id;
        } else {
            // SAFE CREATE: Only save the name, let the defaults handle the rest
            // This prevents crashes from missing fields like 'NeedGownBy'
            const newClient = await prisma.client.create({
                data: { name: body.clientName }
            });
            finalClientId = newClient.id;
        }
    }

    if (!finalClientId) {
         return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    // --- 2. HANDLE SERVICE ---
    let service = await prisma.service.findFirst({
        where: { name: body.serviceName } 
    });

    if (!service) {
        service = await prisma.service.create({
            data: {
                name: body.serviceName || 'Appointment',
                defaultDurationMin: 30,
                color: '#3b82f6'
            }
        });
    }

    // --- 3. PREPARE DATA ---
    const appointmentData = {
        start: new Date(body.start),
        end: new Date(body.end),
        clientId: finalClientId,
        serviceId: service.id,
        date: new Date(body.start),
        durationMinutes: (new Date(body.end).getTime() - new Date(body.start).getTime()) / 60000,
        notes: body.notes,
        status: 'SCHEDULED'
    };

    // --- 4. SAVE ---
    if (body.id) {
        const updated = await prisma.appointment.update({
            where: { id: Number(body.id) },
            data: appointmentData
        });
        return NextResponse.json(updated);
    } else {
        const created = await prisma.appointment.create({
            data: appointmentData
        });
        return NextResponse.json(created);
    }

  } catch (error) {
    console.error("API Error:", error); // Check terminal for this if it fails again
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// DELETE: Remove Appointment
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.appointment.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting' }, { status: 500 });
    }
}