import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all measurements
export async function GET() {
  try {
    const measurements = await prisma.measurement.findMany({
      include: {
        client: true, // optional: include client info
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(measurements);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch measurements' },
      { status: 500 }
    );
  }
}

// CREATE new measurement
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newMeasurement = await prisma.measurement.create({
      data,
    });

    return NextResponse.json(newMeasurement);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create measurement' },
      { status: 500 }
    );
  }
}
