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

      </div>

    </div>
  )
}