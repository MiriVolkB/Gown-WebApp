import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();
    const { amount, method, date, notes } = body;

    const payment = await prisma.payment.create({
      data: {
        clientId: Number(clientId),
        amount: Number(amount),
        //method: method, // e.g., 'CASH', 'CHECK', 'TRANSFER'
        date: new Date(date),
        note: notes,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}