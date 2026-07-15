// src/proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

export async function proxy(req: NextRequest) {
  const token = await req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  console.log("Proxy checking path:", pathname)

  // 1️⃣ Skip proxy for static files, login page, and API routes
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
    // 3️⃣ Get the secret securely from .env
    const secretString = process.env.JWT_SECRET
    if (!secretString) throw new Error("JWT_SECRET missing in proxy")
    
    const SECRET = new TextEncoder().encode(secretString)

    // 4️⃣ Verify JWT token
    const { payload } = await jose.jwtVerify(token, SECRET)
    const role = payload.role as string

    // 5️⃣ Role-based blocking: SECRETARY cannot access /finances
    if (pathname.startsWith("/finances") && role === "SECRETARY") {
      console.log("Secretary tried to access /finances! Redirecting...")
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // ✅ Everything else allowed
    return NextResponse.next()
  } catch (err) {
    console.log("Invalid token, redirecting to login...")
    
    // Clear the bad token before redirecting
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete('token')
    return response
  }
}

// 6️⃣ Proxy matcher — protect everything except login/static/api
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
}