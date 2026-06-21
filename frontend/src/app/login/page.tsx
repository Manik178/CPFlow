import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to CPFlow</CardTitle>
          <CardDescription>
            The Ultimate Competitive Programming Workspace. Sign in to sync your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/onboarding" })
            }}
          >
            <Button type="submit" className="w-full h-11 text-base font-medium">
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
