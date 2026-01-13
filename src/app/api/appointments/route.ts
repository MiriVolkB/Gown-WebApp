import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRescheduleEmail } from '@/lib/email'; // <--- This import was missing!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: { client: true, service: true },
      });
      return NextResponse.json(appointment);
    }

    const appointments = await prisma.appointment.findMany({
      include: { client: true, service: true },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, start, end, clientId, serviceName, notes, notify } = body;

    // 1. Update (or Create) the Appointment in Database
    const updatedAppointment = await prisma.appointment.upsert({
      where: { id: id || 0 }, // If ID is 0/null, it creates new; otherwise updates
      update: {
        start: new Date(start),
        end: new Date(end),
        date: new Date(start), // Sync the 'date' column
        notes,
      },
      create: {
        clientId: parseInt(clientId),
        serviceId: 1, // Default fallback
        start: new Date(start),
        end: new Date(end),
        date: new Date(start),
        durationMinutes: 30,
        notes,
        status: 'SCHEDULED'
      },
      include: {
        client: true,   // Need client info for the email
        service: true
      }
    });

    // 2. Send Email ONLY if the "Notify" box was checked
    if (notify && updatedAppointment.client.email) {
        
        // Format date/time nicely for the email
        const dateStr = new Date(start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const timeStr = new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        await sendRescheduleEmail(
            updatedAppointment.client.email,
            updatedAppointment.client.name,
            dateStr,
            timeStr,
            updatedAppointment.service.name
        );
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error saving appointment:', error);
    return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}