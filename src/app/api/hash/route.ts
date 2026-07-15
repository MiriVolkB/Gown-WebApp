import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  // This forces your specific server to generate a mathematically perfect hash
  const hash = await bcrypt.hash("123456", 10);
  return NextResponse.json({ perfectHash: hash });
}