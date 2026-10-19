import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

export async function POST(req: Request) {
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
    const { projectId, type, amount } = await req.json();

    const owned = await prisma.project.findFirst({
      where: { id: Number(projectId), client: { ownerId: user.id } },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Gown order not found" }, { status: 404 });
    }

    const newExpense = await prisma.expense.create({
      data: {
        projectId: Number(projectId),
        type,
        amount: Number(amount),
      },
    });

    return NextResponse.json(newExpense);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}