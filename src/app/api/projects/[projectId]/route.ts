import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";
import { updateProjectSchema } from "@/lib/validation/project";

export async function PATCH(
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
  if (!isAllowed(user.role, "editGownPrice")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const { projectId } = await params;
    const parsed = updateProjectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = Number(projectId);
    const owned = Number.isInteger(id) && id > 0
      ? await prisma.project.findFirst({
          where: { id, client: { ownerId: user.id } },
          select: { id: true },
        })
      : null;
    if (!owned) {
      return NextResponse.json({ error: "Gown order not found" }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { price: parsed.data.price },
      select: { id: true, price: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update gown price" }, { status: 500 });
  }
}

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