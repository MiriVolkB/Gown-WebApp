import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"


export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    
    // 1. Find the user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { username: username }
    })

    // 🕵️ ADD THIS:
    console.log("Did we find the user in DB?:", user ? "Yes" : "No, user is null")

    if (!user) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 })
    }

    // 2. Compare the typed password with the securely hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    // 🕵️ ADD THIS:
    console.log("Did the bcrypt password match?:", isPasswordValid)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 })
    }

    // 3. Get the secret from .env (Never hardcode it!)
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error("JWT_SECRET is missing from .env")

    // 4. Sign the token using the Database User ID
    const token = jwt.sign({ 
      id: user.id, 
      role: user.role,
      username: user.username
    }, 
      secret, 
      { expiresIn: "1h" }
    )


    // 5. Create the response
    const response = NextResponse.json({ success: true, role: user.role })

    // 6. Set the secure HttpOnly cookie (Your excellent logic here!)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ Automatically false on localhost, true in production
      path: "/",      // ✅ Ensure cookie is available everywhere
      maxAge: 60 * 60 // 1 hour in seconds
    })

    return response

  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}