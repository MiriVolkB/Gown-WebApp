import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> } // 1. Define as Promise
) {
  try {
    // 2. Await the params to get the actual ID
    const { clientId } = await params;
    const clientIdInt = Number(clientId);

    const body = await req.json();
    const { memberName, orderType, price } = body;

    const newProject = await prisma.project.create({
      data: {
        clientId: clientIdInt,
        memberName,
        orderType, 
        price: Number(price),
      },
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}