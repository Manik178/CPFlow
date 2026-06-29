import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PastContestsClient } from "./past-contests-client"

export default async function PastContestsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return <PastContestsClient />
}
