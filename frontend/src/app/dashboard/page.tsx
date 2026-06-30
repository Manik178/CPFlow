import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  let shouldRedirect = false
  // Check if user exists in the database
  try {
    const { fetchServerAPI } = await import("@/lib/api")
    const res = await fetchServerAPI(`/api/users/profile`, { cache: 'no-store' })
    if (res.status === 404) {
      shouldRedirect = true
    }
  } catch (e) {
    // Ignore fetch errors if backend is down, let the client component show the error
  }

  if (shouldRedirect) {
    redirect("/onboarding")
  }

  return <DashboardClient user={session.user} />
}
