import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const SECRET = "supersecret"

const users = [
  { id: 1, username: "owner", password: "123456", role: "OWNER" },
  { id: 2, username: "secretary", password: "123456", role: "SECRETARY" }
]

export async function POST(req: Request) {
  const { username, password } = await req.json()
  const user = users.find(u => u.username === username && u.password === password)

  if (!user) return NextResponse.json({ error: "Invalid login" }, { status: 401 })

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "8h" })

  const response = NextResponse.json({ success: true })

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: false, // ✅ must be false for localhost
    path: "/"      // ✅ ensure cookie is available everywhere
  })

  return response
}