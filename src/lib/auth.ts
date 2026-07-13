import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const SECRET = "supersecret" // Make sure this matches your login route!

// ✅ Make this function async
export async function getUserRole() { 
  // ✅ Await the cookies() function
  const cookieStore = await cookies() 
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, SECRET) as { id: number, role: string }
    return decoded.role
  } catch (error) {
    return null
  }
}