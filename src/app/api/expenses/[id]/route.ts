import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateExpenseSchema } from "@/lib/validation/expense";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

// Returns the expense id only if it belongs to a gown of one of this user's clients.
async function findOwnedExpense(rawId: string, ownerId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const owned = await prisma.expense.findFirst({
    where: { id, project: { client: { ownerId } } },
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
  if (!isAllowed(user.role, "editExpense")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const parsed = updateExpenseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const id = await findOwnedExpense(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const { amount, type } = parsed.data;
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(type && { type }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
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
  if (!isAllowed(user.role, "deleteExpense")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const id = await findOwnedExpense(rawId, user.id);
    if (!id) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
