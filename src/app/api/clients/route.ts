import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";
import { getUser } from "@/lib/getUser";

// --- GET all families ---
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: { ownerId: user.id },
      include: {
        projects: {
          include: {
            expenses: true,
          },
        },
        payments: true,
        appointments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// --- CREATE new family folder and initial gown ---
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    // Simulated success for demo mode — don't write to Prisma
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }

  try {
    const data = await req.json();

    const parsed = CreateClientSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: parsed.error.format()
      }, { status: 400 });
    }

    const val = parsed.data;

    const newClient = await prisma.client.create({
      data: {
        name: val.name,
        phone: val.phone,
        email: val.email || null,
        Recommended: val.Recommended || null,
        notes: val.notes || null,
        WeddingDate: val.WeddingDate ? new Date(val.WeddingDate) : null,
        dueDate: val.dueDate ? new Date(val.dueDate) : null,
        ownerId: user.id,

        projects: {
          create: val.projects.map((p: any) => ({
            memberName: p.memberName,
            orderType: p.orderType,
            price: Number(p.price),
          }))
        },
        payments: val.downpaymentAmount && val.downpaymentAmount > 0
          ? {
              create: {
                amount: val.downpaymentAmount,
                note: "Initial Downpayment",
                method: "cash"
              }
            }
          : undefined
      },

      include: {
        projects: true,
        payments: true,
      }

    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error("Creation Error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}