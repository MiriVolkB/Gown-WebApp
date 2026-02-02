import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { projectId, type, amount } = await req.json();

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