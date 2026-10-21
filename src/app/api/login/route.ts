import { NextResponse } from "next/server"
import * as jose from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || req.headers.get("x-real-ip") || "unknown"
}

// The limiter fails open: if any LoginAttempt query fails, login carries on as normal.
async function getLockMinutesLeft(key: string) {
  try {
    const attempt = await prisma.loginAttempt.findUnique({
      where: { key },
      select: { lockedUntil: true },
    })
    const msLeft = attempt?.lockedUntil ? attempt.lockedUntil.getTime() - Date.now() : 0
    return msLeft > 0 ? Math.ceil(msLeft / 60000) : 0
  } catch (error) {
    console.error("Login limiter check failed:", error)
    return 0
  }
}

async function recordFailedAttempt(key: string) {
  try {
    const now = new Date()
    const attempt = await prisma.loginAttempt.findUnique({ where: { key } })
    const lockExpired = attempt?.lockedUntil != null && attempt.lockedUntil <= now
    const failedCount = !attempt || lockExpired ? 1 : attempt.failedCount + 1
    const lockedUntil =
      failedCount >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60000) : null

    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, failedCount, lockedUntil },
      update: { failedCount, lockedUntil },
    })
  } catch (error) {
    console.error("Login limiter update failed:", error)
  }
}

async function clearAttempts(key: string) {
  try {
    await prisma.loginAttempt.deleteMany({ where: { key } })
  } catch (error) {
    console.error("Login limiter reset failed:", error)
  }
}

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
    const key = `${String(username ?? "").trim().toLowerCase()}|${getClientIp(req)}`

    const minutesLeft = await getLockMinutesLeft(key)
    if (minutesLeft > 0) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutesLeft} minutes.` },
        { status: 429 }
      )
    }

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
      await recordFailedAttempt(key)
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      await recordFailedAttempt(key)
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
      .setExpirationTime("1d")
      .sign(secret)

    await clearAttempts(key)

    const response = NextResponse.json({ success: true, role: user.role })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
