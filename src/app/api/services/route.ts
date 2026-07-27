import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role === 'GUEST') {
      return NextResponse.json({ message: 'Simulated success for demo mode' });
    }
    if (user.role === 'SECRETARY') {
      return NextResponse.json({ error: 'Only owners can manage services' }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body.name || '').trim();
    const defaultDurationMin = Number(body.defaultDurationMin) || 30;
    const color = String(body.color || '#3b82f6').trim();
    const active = body.active !== false;

    if (!name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    const existing = await prisma.service.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json({ error: 'A service with this name already exists' }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: { name, defaultDurationMin, color, active },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
  }
}
