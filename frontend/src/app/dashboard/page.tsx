import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Check if user exists in the database
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const res = await fetch(`${apiUrl}/api/users/${session.user.id}/profile`, { cache: 'no-store' })
    if (res.status === 404) {
      redirect("/onboarding")
    }
  } catch (e) {
    // Ignore fetch errors if backend is down, let the client component show the error
  }

  return <DashboardClient user={session.user} />
}
