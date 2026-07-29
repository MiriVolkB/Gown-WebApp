import { NextResponse } from "next/server"
import * as jose from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 })
    }

    const secretString = process.env.JWT_SECRET
    if (!secretString) throw new Error("JWT_SECRET is missing from .env")

    const secret = new TextEncoder().encode(secretString)
    const token = await new jose.SignJWT({
      id: user.id,
      role: user.role,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret)

    const response = NextResponse.json({ success: true, role: user.role })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
