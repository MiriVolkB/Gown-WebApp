import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUser } from '@/lib/getUser';

const prisma = new PrismaClient();

// GET: Fetch all appointments
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { client: { ownerId: user.id } },
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
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role === 'GUEST') {
      return NextResponse.json({ message: 'Simulated success for demo mode' });
    }

    const body = await request.json();

    // --- 1. HANDLE CLIENT ---
    let finalClientId = body.clientId ? Number(body.clientId) : null;

    // If we have no ID but we have a Name, try to find the existing client
    if (!finalClientId && body.clientName) {
        const existingClient = await prisma.client.findFirst({
            where: {
                ownerId: user.id,
                name: {
                    equals: body.clientName,
                    mode: 'insensitive'
                }
            }
        });

        if (existingClient) {
            finalClientId = existingClient.id;
        } else {
            const newClient = await prisma.client.create({
                data: {
                    name: body.clientName,
                    phone: body.clientPhone || "000-000-0000",
                    ownerId: user.id,
                }
            });
            finalClientId = newClient.id;
        }
    }

    if (!finalClientId) {
         return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    const ownedClient = await prisma.client.findFirst({
      where: { id: finalClientId, ownerId: user.id },
      select: { id: true },
    });
    if (!ownedClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
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
        const existing = await prisma.appointment.findFirst({
          where: { id: Number(body.id), client: { ownerId: user.id } },
        });
        if (!existing) {
          return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }
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
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// DELETE: Remove Appointment
export async function DELETE(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (user.role === 'GUEST') {
          return NextResponse.json({ success: true });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await prisma.appointment.findFirst({
          where: { id: Number(id), client: { ownerId: user.id } },
        });
        if (!existing) {
          return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        await prisma.appointment.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting' }, { status: 500 });
    }
}