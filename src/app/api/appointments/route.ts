import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';
import {
  clearAppointmentsCache,
  getAppointmentsCache,
  setAppointmentsCache,
} from '@/lib/appointments-cache';

const ownedAppointmentWhere = (userId: string) => ({
  OR: [
    { ownerId: userId },
    { client: { ownerId: userId } },
  ],
});

type AppointmentRow = {
  id: number;
  start: Date;
  end: Date;
  title: string | null;
  notes: string | null;
  clientId: number | null;
  serviceId: number;
  status: string;
  ownerId: string | null;
  client_id: number | null;
  client_name: string | null;
  service_id: number | null;
  service_name: string | null;
  service_color: string | null;
};

// GET: Fetch all appointments (single SQL round-trip + short cache)
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cached = getAppointmentsCache(user.id);
    if (cached) {
      return NextResponse.json(cached);
    }

    // One round-trip instead of Prisma's appointment + clients + services queries
    const rows = await prisma.$queryRaw<AppointmentRow[]>`
      SELECT
        a.id,
        a.start,
        a."end",
        a.title,
        a.notes,
        a."clientId",
        a."serviceId",
        a.status,
        a."ownerId",
        c.id AS client_id,
        c.name AS client_name,
        s.id AS service_id,
        s.name AS service_name,
        s.color AS service_color
      FROM "Appointment" a
      LEFT JOIN "Client" c ON c.id = a."clientId"
      LEFT JOIN "Service" s ON s.id = a."serviceId"
      WHERE a."ownerId" = ${user.id}
         OR c."ownerId" = ${user.id}
      ORDER BY a.start ASC
    `;

    const appointments = rows.map((row) => ({
      id: row.id,
      start: row.start,
      end: row.end,
      title: row.title,
      notes: row.notes,
      clientId: row.clientId,
      serviceId: row.serviceId,
      status: row.status,
      ownerId: row.ownerId,
      client: row.client_id
        ? { id: row.client_id, name: row.client_name }
        : null,
      service: row.service_id
        ? { id: row.service_id, name: row.service_name, color: row.service_color }
        : null,
    }));

    setAppointmentsCache(user.id, appointments);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
  }
}

type SavedClient = { id: number; name: string };
type SavedService = { id: number; name: string; color: string | null };

function appointmentResponse(
  row: {
    id: number;
    start: Date;
    end: Date;
    title: string | null;
    notes: string | null;
    clientId: number | null;
    serviceId: number;
    status: string;
    ownerId: string | null;
  },
  client: SavedClient | null,
  service: SavedService
) {
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    title: row.title,
    notes: row.notes,
    clientId: row.clientId,
    serviceId: row.serviceId,
    status: row.status,
    ownerId: row.ownerId,
    client: client ? { id: client.id, name: client.name } : null,
    service: { id: service.id, name: service.name, color: service.color },
  };
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

    clearAppointmentsCache(user.id);
    const body = await request.json();

    const existing = body.id
      ? await prisma.appointment.findFirst({
          where: { id: Number(body.id), ...ownedAppointmentWhere(user.id) },
          select: {
            id: true,
            clientId: true,
            ownerId: true,
            notes: true,
            title: true,
            serviceId: true,
          },
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

    let eventTitle: string | null = null;
    if (isCustomEvent) {
      eventTitle = (body.eventTitle || body.title || existing?.title || '').trim();
      if (!eventTitle) {
        return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
      }
    }

    const serviceName = (
      body.serviceName ||
      (isCustomEvent ? 'Other' : '')
    ).trim();

    // Client and service lookups are independent, so they run together.
    const servicePromise = (async (): Promise<SavedService> => {
      const name = serviceName || (isCustomEvent ? 'Other' : 'Appointment');
      const found = name
        ? await prisma.service.findFirst({
            where: { name },
            select: { id: true, name: true, color: true },
          })
        : null;
      if (found) return found;

      const fallbackId = body.serviceId || existing?.serviceId;
      if (fallbackId) {
        const byId = await prisma.service.findUnique({
          where: { id: Number(fallbackId) },
          select: { id: true, name: true, color: true },
        });
        if (byId) return byId;
      }

      return prisma.service.create({
        data: {
          name,
          defaultDurationMin: 30,
          color: isCustomEvent ? '#64748b' : '#3b82f6',
        },
        select: { id: true, name: true, color: true },
      });
    })();
    // Keep a rejection from becoming an unhandled error if we return early.
    void servicePromise.catch(() => undefined);

    let client: SavedClient | null = null;

    if (!isCustomEvent) {
      const requestedClientId = body.clientId
        ? Number(body.clientId)
        : existing?.clientId ?? null;

      if (requestedClientId) {
        client = await prisma.client.findFirst({
          where: { id: requestedClientId, ownerId: user.id },
          select: { id: true, name: true },
        });
        if (!client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
      } else if (body.clientName) {
        const name = String(body.clientName).trim();
        client = await prisma.client.findFirst({
          where: {
            ownerId: user.id,
            name: { equals: name, mode: 'insensitive' },
          },
          select: { id: true, name: true },
        });
        if (!client) {
          client = await prisma.client.create({
            data: {
              name,
              phone: body.clientPhone || '000-000-0000',
              ownerId: user.id,
            },
            select: { id: true, name: true },
          });
        }
      }

      if (!client) {
        return NextResponse.json({ error: 'Client is required' }, { status: 400 });
      }
    }

    const service = await servicePromise;

    const appointmentData = {
      start: new Date(body.start),
      end: new Date(body.end),
      clientId: client?.id ?? null,
      title: eventTitle,
      serviceId: service.id,
      date: new Date(body.start),
      durationMinutes:
        (new Date(body.end).getTime() - new Date(body.start).getTime()) / 60000,
      notes: body.notes ?? existing?.notes ?? null,
      status: 'SCHEDULED' as const,
      ownerId: existing?.ownerId || user.id,
    };

    const saved = existing
      ? await prisma.appointment.update({
          where: { id: existing.id },
          data: appointmentData,
        })
      : await prisma.appointment.create({ data: appointmentData });

    return NextResponse.json(appointmentResponse(saved, client, service));
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

    clearAppointmentsCache(user.id);
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
