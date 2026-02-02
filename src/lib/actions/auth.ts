"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // DEBUGGING: Print the URL with brackets to find hidden spaces
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log(`Checking Connection to: [${url}]`); // <--- Look closely at this log!
  
  // 1. Get the data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Attempting login for:", email); // Debug log

  // 2. Try to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 3. If there is an error, PRINT IT to the terminal
  if (error) {
    console.error("Supabase Login Error:", error.message); // <--- THIS IS KEY
    console.error("Full Error Object:", error);
    
    // Redirect with the generic message for the user
    return redirect("/login?error=Could not authenticate user");
  }

  // 4. Success!
  console.log("Login successful!");
  revalidatePath("/", "layout");
  redirect("/");
}