import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Error fetching account' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role === 'GUEST') {
      return NextResponse.json({ message: 'Simulated success for demo mode' });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Error updating account' }, { status: 500 });
  }
}
