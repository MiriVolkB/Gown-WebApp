import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { isAllowed } from "@/lib/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> } // 1. Define as Promise
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role === "GUEST") {
    return NextResponse.json({ message: "Simulated success for demo mode" });
  }
  if (!isAllowed(user.role, "addFamilyMember")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    // 2. Await the params to get the actual ID
    const { clientId } = await params;
    const clientIdInt = Number(clientId);

    const owned = await prisma.client.findFirst({
      where: { id: clientIdInt, ownerId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

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