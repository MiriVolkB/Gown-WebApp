"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { markGuestWelcomePending } from "@/components/GuestWelcomeModal"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Warm the DB connection so the first login isn't paying cold-start latency.
  useEffect(() => {
    fetch("/api/login", { method: "HEAD" }).catch(() => {})
  }, [])

  const finishLogin = async (res: Response) => {
    if (!res.ok) return false

    const data = await res.json().catch(() => ({}))
    if (data.role === "GUEST") {
      markGuestWelcomePending()
    }

    // Full navigation once — avoids router.push + refresh double-fetching home APIs.
    window.location.assign("/")
    return true
  }

  const handleLogin = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const ok = await finishLogin(res)
      if (!ok) {
        setLoading(false)
        alert("Invalid username or password")
      }
    } catch {
      setLoading(false)
      alert("Login failed. Please try again.")
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: "Guest", password: "123456" }),
      })

      const ok = await finishLogin(res)
      if (!ok) {
        setLoading(false)
        alert("Guest login failed. Check backend configuration.")
      }
    } catch {
      setLoading(false)
      alert("Guest login failed. Please try again.")
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

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="border p-2 w-full rounded pr-10"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white w-full p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

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
