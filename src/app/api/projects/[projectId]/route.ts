import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
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