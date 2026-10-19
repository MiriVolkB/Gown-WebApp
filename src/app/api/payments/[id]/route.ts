import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePaymentSchema } from "@/lib/validation/payment";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

// Returns the payment id only if it belongs to one of this user's clients.
async function findOwnedPayment(rawId: string, ownerId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const owned = await prisma.payment.findFirst({
    where: { id, client: { ownerId } },
    select: { id: true },
  });
  return owned?.id ?? null;
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "editPayment")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const parsed = updatePaymentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const id = await findOwnedPayment(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const { amount, method, date } = parsed.data;
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(method && { method }),
        ...(date && { date: new Date(date) }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "deletePayment")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const id = await findOwnedPayment(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
