import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "addPayment")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { clientId } = await params;

    const owned = await prisma.client.findFirst({
      where: { id: Number(clientId), ownerId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount, method, date, notes } = body;

    const payment = await prisma.payment.create({
      data: {
        clientId: Number(clientId),
        amount: Number(amount),
        ...(method && { method }),
        // save provided method (optional fallback)
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