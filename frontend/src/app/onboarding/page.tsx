import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <OnboardingForm user={session.user} />
    </div>
  )
}
