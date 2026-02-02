import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";

// --- GET all families ---
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          include: {
            expenses: true, // Needed for total price breakdown later
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// --- CREATE new family folder and initial gown ---
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Use the specific schema we updated
    const parsed = CreateClientSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: parsed.error.format()
      }, { status: 400 });
    }

    const val = parsed.data;

    // 2. Create the data structure
    const newClient = await prisma.client.create({
      data: {
        name: val.name,
        phone: val.phone,
        email: val.email || null,
        Recommended: val.Recommended || null,
        notes: val.notes || null,
        WeddingDate: val.WeddingDate ? new Date(val.WeddingDate) : null,
        dueDate: val.dueDate ? new Date(val.dueDate) : null,

        // 3. The Nested Create for the first project
        // This 'create' nested here handles the whole array of family members
        projects: {
          create: val.projects.map((p: any) => ({
            memberName: p.memberName,
            orderType: p.orderType,
            price: Number(p.price),
          }))
        }
      },
      include: {
        projects: true // Include them in the response so we can verify
      }
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error("Creation Error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}