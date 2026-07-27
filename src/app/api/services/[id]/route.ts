import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const serviceId = Number(id);
    if (!Number.isFinite(serviceId)) {
      return NextResponse.json({ error: 'Invalid service id' }, { status: 400 });
    }

    const existing = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      name?: string;
      defaultDurationMin?: number;
      color?: string;
      active?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
      }
      const duplicate = await prisma.service.findFirst({
        where: {
          id: { not: serviceId },
          name: { equals: name, mode: 'insensitive' },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'A service with this name already exists' }, { status: 409 });
      }
      data.name = name;
    }
    if (body.defaultDurationMin !== undefined) {
      data.defaultDurationMin = Number(body.defaultDurationMin) || existing.defaultDurationMin;
    }
    if (body.color !== undefined) {
      data.color = String(body.color).trim();
    }
    if (body.active !== undefined) {
      data.active = Boolean(body.active);
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
  }
}
