"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { User } from "next-auth"

export function OnboardingForm({ user }: { user: User }) {
  const router = useRouter()
  const [handles, setHandles] = useState({
    codeforces: "",
    codechef: "",
    cses: "",
    leetcode: "",
  })

  const onboardMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = ""
      const res = await fetch(`${apiUrl}/api/users/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to onboard")
      return res.json()
    },
    onSuccess: () => {
      window.location.href = "/dashboard"
    },
    onError: (error) => {
      alert("Error saving profile: " + error.message + ". Check Vercel logs or network tab.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onboardMutation.mutate({
      name: user.name,
      image: user.image,
      handles: {
        codeforces: handles.codeforces || null,
        codechef: handles.codechef || null,
        cses: handles.cses || null,
        leetcode: handles.leetcode || null,
      }
    })
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Connect Your Accounts</CardTitle>
        <CardDescription>
          Link your competitive programming handles to unlock unified analytics. You can skip any you don't use.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="codeforces" className="text-sm font-medium leading-none">Codeforces Handle</label>
            <Input
              id="codeforces"
              placeholder="e.g. tourist"
              value={handles.codeforces}
              onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="codechef" className="text-sm font-medium leading-none">CodeChef Username</label>
            <Input
              id="codechef"
              placeholder="e.g. genna"
              value={handles.codechef}
              onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cses" className="text-sm font-medium leading-none">CSES Username</label>
            <Input
              id="cses"
              placeholder="e.g. benq"
              value={handles.cses}
              onChange={(e) => setHandles({ ...handles, cses: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="leetcode" className="text-sm font-medium leading-none">LeetCode Username</label>
            <Input
              id="leetcode"
              placeholder="e.g. neetcode"
              value={handles.leetcode}
              onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
            disabled={onboardMutation.isPending}
          >
            Skip for now
          </Button>
          <Button type="submit" disabled={onboardMutation.isPending}>
            {onboardMutation.isPending ? "Connecting..." : "Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
