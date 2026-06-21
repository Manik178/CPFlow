"use client"

import { useQuery } from "@tanstack/react-query"
import type { User } from "next-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2 } from "lucide-react"

export function DashboardClient({ user }: { user: User }) {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["userProfile", user.id],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/users/${user.id}/profile`)
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-4xl font-outfit font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading connected handles...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load handles. Is the backend running?</p>
        ) : (
          <>
            <HandleCard platform="Codeforces" handle={profile?.handles?.codeforces} color="text-blue-500" />
            <HandleCard platform="CodeChef" handle={profile?.handles?.codechef} color="text-orange-500" />
            <HandleCard platform="CSES" handle={profile?.handles?.cses} color="text-emerald-500" />
            <HandleCard platform="LeetCode" handle={profile?.handles?.leetcode} color="text-yellow-500" />
          </>
        )}
      </div>
    </div>
  )
}

function HandleCard({ platform, handle, color }: { platform: string, handle?: string | null, color: string }) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/50">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Code2 className={`w-4 h-4 ${color}`} />
          {platform}
        </CardDescription>
        <CardTitle className="text-xl font-medium">
          {handle ? (
            <span className="text-zinc-100">{handle}</span>
          ) : (
            <span className="text-zinc-500 italic text-sm font-normal">Not connected</span>
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
