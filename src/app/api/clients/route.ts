import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all clients (Sorted A-Z)
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc', // Sort alphabetically so it's easier to search
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// CREATE new client (Optional, but good to keep)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newClient = await prisma.client.create({ data });
    return NextResponse.json(newClient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}