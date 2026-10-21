import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  // Local development helper only
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // This forces your specific server to generate a mathematically perfect hash
  const hash = await bcrypt.hash("123456", 10);
  return NextResponse.json({ perfectHash: hash });
}