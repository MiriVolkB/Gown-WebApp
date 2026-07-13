"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {

  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {

    setLoading(true)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })

    setLoading(false)

    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      alert("Invalid username or password")
    }
  }

  // ✅ New function specifically for the 1-Click login
  const handleGuestLogin = async () => {
    setLoading(true)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Hardcode the guest credentials we added to the backend
      body: JSON.stringify({ username: "demo_recruiter", password: "demo_password" })
    })

    setLoading(false)

    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      alert("Guest login failed. Check backend configuration.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-80">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          CRM Login
        </h1>

        <input
          className="border p-2 w-full mb-4 rounded"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white w-full p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* ✅ Visual Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* ✅ The Recruiter Button */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="border-2 border-black text-black font-medium w-full p-2 rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {loading ? "Preparing Demo..." : "Explore as Guest (1-Click)"}
        </button>

      </div>

    </div>
  )
}