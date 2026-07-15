// app/page.tsx
import { getUser } from "@/lib/getUser";
import HomePage from "@/components/HomePage"; // Adjust this import path to wherever you put your client component

export default async function Page() {
  // 1. Fetch the user securely on the server
  const user = await getUser();

  // 2. Pass it down to your interactive client component
  return <HomePage user={user} />;
}