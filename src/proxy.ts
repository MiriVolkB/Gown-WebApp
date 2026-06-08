// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

const SECRET = new TextEncoder().encode("supersecret")

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  console.log("Middleware checking path:", pathname)

  // 1️⃣ Skip middleware for static files, login page, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // 2️⃣ No token → redirect to login
  if (!token) {
    console.log("No token found, redirecting...")
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    // 3️⃣ Verify JWT token
    const { payload } = await jose.jwtVerify(token, SECRET)
    const role = payload.role as string

    // 4️⃣ Role-based blocking: SECRETARY cannot access /finances
    if (pathname.startsWith("/finances") && role === "SECRETARY") {
      console.log("Secretary tried to access /finances! Redirecting...")
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // ✅ Everything else allowed
    return NextResponse.next()
  } catch (err) {
    console.log("Invalid token, redirecting to login...")
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

// 5️⃣ Middleware matcher — protect everything except login/static/api
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
}