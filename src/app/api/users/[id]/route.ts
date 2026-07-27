import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

const ALLOWED_ROLES = ['OWNER', 'SECRETARY', 'GUEST'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can manage users' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const data: { role?: string; passwordHash?: string } = {};

    if (body.role !== undefined) {
      const role = String(body.role).toUpperCase();
      if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      if (existing.id === user.id && role !== 'OWNER') {
        return NextResponse.json(
          { error: 'You cannot remove your own owner role' },
          { status: 400 }
        );
      }
      data.role = role;
    }

    if (body.password) {
      const password = String(body.password);
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}
