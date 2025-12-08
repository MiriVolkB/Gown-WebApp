import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: 'asc' },
      include: { client: true, service: true },
  });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// CREATE new appointment
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newAppointment = await prisma.appointment.create({
      data,
    });

    return NextResponse.json(newAppointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
