"use client"

import { useQuery } from "@tanstack/react-query"
import type { User } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, CheckCircle2 } from "lucide-react"
import { CodeforcesAnalytics } from "@/components/analytics/codeforces-analytics"
import { LeetCodeAnalytics } from "@/components/analytics/leetcode-analytics"
import { CodeChefAnalytics } from "@/components/analytics/codechef-analytics"
import { CumulativeAnalytics } from "@/components/analytics/cumulative-analytics"
import { CumulativeHeatmap } from "@/components/analytics/cumulative-heatmap"
import { ConnectHandleModal } from "@/components/dashboard/connect-handle-modal"

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
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/contests" className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-sm font-medium">
            Contest Tracker
          </Link>
          <Link href="/workspace" className="px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors text-sm font-medium">
            Workspace
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading connected handles...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load handles. Is the backend running?</p>
        ) : (
          <>
            <HandleCard 
              userId={user.id!} 
              platform="Codeforces" 
              handle={profile?.handles?.codeforces} 
              color="text-blue-500" 
              analytics={<CodeforcesAnalytics handle={profile?.handles?.codeforces as string} />}
            />
            <HandleCard 
              userId={user.id!} 
              platform="CodeChef" 
              handle={profile?.handles?.codechef} 
              color="text-orange-500" 
              analytics={<CodeChefAnalytics handle={profile?.handles?.codechef as string} />}
            />
            <HandleCard 
              userId={user.id!} 
              platform="CSES" 
              handle={profile?.handles?.cses} 
              color="text-emerald-500" 
            />
            <HandleCard 
              userId={user.id!} 
              platform="LeetCode" 
              handle={profile?.handles?.leetcode} 
              color="text-yellow-500" 
              analytics={<LeetCodeAnalytics handle={profile?.handles?.leetcode as string} />}
            />
          </>
        )}
      </div>

      <div className="pt-8 space-y-12">
        {profile && (
          <div className="space-y-6">
            <CumulativeAnalytics profile={profile} />
            <CumulativeHeatmap profile={profile} />
          </div>
        )}
      </div>
    </div>
  )
}

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

function HandleCard({ userId, platform, handle, color, analytics }: { userId: string, platform: string, handle?: string | null, color: string, analytics?: React.ReactNode }) {
  if (!handle) {
    return (
      <Card className="bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
        <CardHeader className="pb-4">
          <CardDescription className="flex items-center gap-2">
            <Code2 className={`w-4 h-4 ${color}`} />
            {platform}
          </CardDescription>
          <div className="mt-2 flex items-center justify-between">
            <CardTitle className="text-xl font-medium">
              <span className="text-zinc-500 italic text-sm font-normal">Not connected</span>
            </CardTitle>
            <ConnectHandleModal userId={userId} platform={platform} color={color} />
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={<div className="cursor-pointer group block" />}>
          <Card className="bg-zinc-900/40 border-zinc-800/50 group-hover:bg-zinc-900/60 transition-colors h-full">
            <CardHeader className="pb-4">
              <CardDescription className="flex items-center gap-2">
                <Code2 className={`w-4 h-4 ${color}`} />
                {platform}
              </CardDescription>
              <div className="mt-2 flex items-center justify-between">
                <CardTitle className="text-xl font-medium">
                  <span className="text-zinc-100 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                    {handle}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
      </DialogTrigger>
      {analytics && (
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-full sm:max-w-4xl bg-zinc-950 border-zinc-800 p-6 overflow-y-auto max-h-[90vh]">
          {analytics}
        </DialogContent>
      )}
    </Dialog>
  )
}
