import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET all clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany();
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// CREATE new client
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newClient = await prisma.client.create({ data });
    return NextResponse.json(newClient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
