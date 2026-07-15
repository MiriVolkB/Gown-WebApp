import { cookies } from "next/headers"
import * as jose from "jose"

export async function getUser() {
  // 1. Await the cookies function first
  const cookieStore = await cookies()
  
  // 2. Then get the token
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    // 2. Get the secret to decode the token
    const secretString = process.env.JWT_SECRET
    if (!secretString) return null
    
    const SECRET = new TextEncoder().encode(secretString)

    // 3. Verify and decode the token
    const { payload } = await jose.jwtVerify(token, SECRET)

    // 4. Return the user data we packed into the token during login
    return {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as string,
    }
  } catch (error) {
    // If the token is expired or invalid, return null
    return null
  }
}