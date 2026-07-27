import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

const ALLOWED_ROLES = ['OWNER', 'SECRETARY', 'GUEST'] as const;

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can manage users' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can manage users' }, { status: 403 });
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const role = String(body.role || 'SECRETARY').toUpperCase();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { username, passwordHash, role },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
