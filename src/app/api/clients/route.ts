import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { z, ZodError } from "zod";

// --- Zod schema (matches your form) ---
const newClientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal('')),
  notes: z.string().optional(),
  Recommended: z.string().optional(),
  WeddingDate: z.string().optional(),
  dueDate: z.string().optional(),
});

// --- GET all clients ---
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: { measurements: true },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// --- CREATE new client ---
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const parsed = newClientSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const validatedData = parsed.data;

    const newClient = await prisma.client.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone ?? "",
        email: validatedData.email ?? null,
        notes: validatedData.notes ?? null,
        Recommended: validatedData.Recommended ?? null,
        WeddingDate: validatedData.WeddingDate
          ? new Date(validatedData.WeddingDate)
          : null,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : null,
      },
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

