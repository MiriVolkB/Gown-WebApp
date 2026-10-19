import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "addExpense")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { projectId } = await params;

    const owned = await prisma.project.findFirst({
      where: { id: Number(projectId), client: { ownerId: user.id } },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Gown order not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, amount, date } = body;

    const newExpense = await prisma.expense.create({
      data: {
        projectId: Number(projectId),
        type,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(newExpense);
  } catch (error) {
    console.error("Expense API Error:", error);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}