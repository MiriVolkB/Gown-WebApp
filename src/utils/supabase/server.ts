import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import dns from "node:dns";

// 1. Force IPv4 (Keep this from the previous fix)
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

export async function createClient() {
  const cookieStore = await cookies();

  // 2. HARDCODED KEYS (We bypass the .env file completely)
  const supabaseUrl = "https://qpilhhrdijebwcpovabs.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaWxoaHJkaWplYndjcG92YWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTYyNDcsImV4cCI6MjA3OTEzMjI0N30.IZXiH-jaz22Q8hCWqaKmaxFB4mtC-MZx37epi39_-OA";

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored
        }
      },
    },
  });
}