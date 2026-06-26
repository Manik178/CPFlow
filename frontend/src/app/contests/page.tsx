import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ContestsClient } from "./contests-client"

export default async function ContestsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return <ContestsClient />
}
