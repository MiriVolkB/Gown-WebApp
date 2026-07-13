import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validation/client.schema";
import { getUserRole } from "@/lib/auth";

// --- GET all families ---
export async function GET() {
  try {
    // 2. Grab the role in ONE line!
    const role = await getUserRole();

    // 3. If it's a guest, send the fake demo data
    if (role === "GUEST") {
      return NextResponse.json([
        {
          id: "demo-1",
          name: "The Smith Family (DEMO)",
          phone: "555-0192",
          projects: [],
          payments: [],
          appointments: []
        }
        // ... add a couple more fake objects here
      ]);
    }
  
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          include: {
            expenses: true, // Needed for total price breakdown later
          }
        },
        payments: true,
        // 🗓️ YOU NEED TO ADD THIS LINE!
        appointments: true,
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
  // 🛡️ PHASE 3 IMPLEMENTED HERE: Block the guest from creating real data
    const role = await getUserRole();
    if (role === "GUEST") {
      // Return a 200 OK so the frontend thinks it worked and doesn't crash, 
      // but don't actually save anything to Prisma!
      return NextResponse.json({ message: "Simulated success for demo mode" });
    }
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
        },
        // 4. NEW: Create the downpayment if the amount is greater than 0
        payments: val.downpaymentAmount && val.downpaymentAmount > 0 
          ? {
              create: {
                amount: val.downpaymentAmount,
                note: "Initial Downpayment",
                method: "cash" // Defaults to cash as per your schema, change if needed
              }
            } 
          : undefined // If undefined, Prisma completely ignores the payment creation
      },
      
      include: {
        projects: true, // Include them in the response so we can verify
        payments: true,
      }

    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error("Creation Error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}