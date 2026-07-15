import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUser } from '@/lib/getUser';

const prisma = new PrismaClient();

const ownedAppointmentWhere = (userId: string) => ({
  OR: [
    { ownerId: userId },
    { client: { ownerId: userId } },
  ],
});

// GET: Fetch all appointments
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: ownedAppointmentWhere(user.id),
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

    const existing = body.id
      ? await prisma.appointment.findFirst({
          where: { id: Number(body.id), ...ownedAppointmentWhere(user.id) },
          include: { service: true },
        })
      : null;

    if (body.id && !existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const isCustomEvent =
      body.bookingType === 'custom' ||
      (body.bookingType !== 'client' &&
        (Boolean(body.eventTitle || body.title) ||
          (!body.clientId && !body.clientName && existing?.clientId == null)));

    // --- 1. HANDLE CLIENT (optional for custom events) ---
    let finalClientId: number | null = null;
    let eventTitle: string | null = null;

    if (isCustomEvent) {
      eventTitle = (
        body.eventTitle ||
        body.title ||
        existing?.title ||
        ''
      ).trim();
      if (!eventTitle) {
        return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
      }
    } else {
      finalClientId = body.clientId
        ? Number(body.clientId)
        : existing?.clientId ?? null;

      if (!finalClientId && body.clientName) {
        const existingClient = await prisma.client.findFirst({
          where: {
            ownerId: user.id,
            name: {
              equals: body.clientName,
              mode: 'insensitive',
            },
          },
        });

        if (existingClient) {
          finalClientId = existingClient.id;
        } else {
          const newClient = await prisma.client.create({
            data: {
              name: body.clientName,
              phone: body.clientPhone || '000-000-0000',
              ownerId: user.id,
            },
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
    }

    // --- 2. HANDLE SERVICE ---
    const serviceName = isCustomEvent
      ? body.serviceName || existing?.service?.name || 'Other'
      : body.serviceName || existing?.service?.name;

    let service = serviceName
      ? await prisma.service.findFirst({ where: { name: serviceName } })
      : null;

    if (!service && (body.serviceId || existing?.serviceId)) {
      service = await prisma.service.findUnique({
        where: { id: Number(body.serviceId || existing?.serviceId) },
      });
    }

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceName || (isCustomEvent ? 'Other' : 'Appointment'),
          defaultDurationMin: 30,
          color: isCustomEvent ? '#64748b' : '#3b82f6',
        },
      });
    }

    // --- 3. PREPARE DATA ---
    const appointmentData = {
      start: new Date(body.start),
      end: new Date(body.end),
      clientId: finalClientId,
      title: eventTitle,
      serviceId: service.id,
      date: new Date(body.start),
      durationMinutes:
        (new Date(body.end).getTime() - new Date(body.start).getTime()) / 60000,
      notes: body.notes ?? existing?.notes ?? null,
      status: 'SCHEDULED' as const,
      ownerId: existing?.ownerId || user.id,
    };

    // --- 4. SAVE ---
    if (existing) {
      const updated = await prisma.appointment.update({
        where: { id: existing.id },
        data: appointmentData,
        include: { client: true, service: true },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.appointment.create({
      data: appointmentData,
      include: { client: true, service: true },
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error('API Error:', error);
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
      where: { id: Number(id), ...ownedAppointmentWhere(user.id) },
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
