"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { User } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, CheckCircle2, Trash2, TerminalSquare, PlusCircle } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { format } from "date-fns"
import { CodeforcesAnalytics } from "@/components/analytics/codeforces-analytics"
import { LeetCodeAnalytics } from "@/components/analytics/leetcode-analytics"
import { CodeChefAnalytics } from "@/components/analytics/codechef-analytics"
import { CodeforcesIcon, CodeChefIcon, CsesIcon, LeetCodeIcon } from "@/components/icons/PlatformIcons"
import { CumulativeAnalytics } from "@/components/analytics/cumulative-analytics"
import { CumulativeHeatmap } from "@/components/analytics/cumulative-heatmap"
import { ConnectHandleModal } from "@/components/dashboard/connect-handle-modal"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RecommendationsModal } from "@/components/dashboard/recommendations-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardClient({ user }: { user: User }) {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["userProfile", user.id],
    queryFn: async () => {
      const apiUrl = ""
      const res = await fetch(`${apiUrl}/api/users/profile`)
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    }
  })

  const { data: recentWorkspacesData, isLoading: loadingRecent } = useQuery({
    queryKey: ["recentWorkspaces", user.id],
    queryFn: async () => {
      const apiUrl = ""
      const res = await fetch(`${apiUrl}/api/workspace/recent?limit=50`)
      if (!res.ok) throw new Error("Failed to fetch recent workspaces")
      const data = await res.json()
      
      try {
        const { getMetadata } = await import("@/features/workspace/db/indexeddb")
        for (const ws of data.workspaces) {
          if (!ws.title || ws.title === ws.problemId) {
            const localMeta = await getMetadata(ws.platform, ws.problemId)
            if (localMeta && localMeta.title) {
              ws.title = localMeta.title
            }
          }
        }
      } catch (e) {
        console.error("Failed to enrich workspace titles from local DB", e)
      }
      
      return data
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/contests/past" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
            Past Contests
          </Link>
          <Link href="/contests" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
            Contest Tracker
          </Link>
          <RecommendationsModal />
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="rounded-full" />}>
              Continue Solving
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl w-full max-h-[80vh] flex flex-col bg-zinc-950 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Recent Workspaces</DialogTitle>
                <DialogDescription>Pick up right where you left off.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                {!loadingRecent && recentWorkspacesData?.workspaces?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    {recentWorkspacesData.workspaces.map((ws: any) => (
                      <Link key={`${ws.platform}-${ws.problemId}-${ws.language}`} href={`/workspace?platform=${ws.platform}&pid=${ws.problemId}`} className="block group">
                        <Card className="bg-zinc-900/20 border-zinc-800/50 group-hover:bg-zinc-900/60 group-hover:border-zinc-700 transition-all duration-300 ease-out h-full">
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">{ws.platform}</span>
                              <span className="text-[10px] text-zinc-500">{new Date(ws.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <CardTitle className="text-base font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                              {(ws as any).title || ws.problemId}
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-400 mt-1">
                              {ws.language}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : !loadingRecent ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <TerminalSquare className="w-12 h-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300">No recent workspaces</h3>
                    <p className="text-sm text-zinc-500 mt-1 mb-6">You haven't opened any problems recently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    <Skeleton className="h-[100px] w-full" />
                    <Skeleton className="h-[100px] w-full" />
                    <Skeleton className="h-[100px] w-full" />
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Link href="/workspace" className={buttonVariants({ className: "rounded-full" })}>
            Workspace
          </Link>
          <Button 
            variant="ghost" 
            className="rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => signOut({ callbackUrl: "/login" })} 
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </>
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

function HandleCard({ userId, platform, handle, color, analytics }: { userId: string, platform: string, handle?: string | null, color: string, analytics?: React.ReactNode }) {
  const queryClient = useQueryClient()
  const removeMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = ""
      const currentRes = await fetch(`${apiUrl}/api/users/profile`)
      if (!currentRes.ok) throw new Error("Failed to fetch profile")
      const currentProfile = await currentRes.json()

      const updatedHandles = {
        ...currentProfile.handles,
        [platform.toLowerCase()]: ""
      }

      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handles: updatedHandles,
          preferences: currentProfile.preferences
        })
      })

      if (!res.ok) throw new Error("Failed to update handle")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
    }
  })

  if (!handle) {
    return (
      <Card className="bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300 ease-out">
        <CardHeader className="pb-4">
          <CardDescription className="flex items-center gap-2">
            {platform === "Codeforces" && <CodeforcesIcon className="w-5 h-5" />}
            {platform === "CodeChef" && <CodeChefIcon className="w-5 h-5" />}
            {platform === "CSES" && <CsesIcon className="w-5 h-5" />}
            {platform === "LeetCode" && <LeetCodeIcon className="w-5 h-5" />}
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
          <Card className="bg-zinc-900/20 border-zinc-800/50 group-hover:bg-zinc-900/50 group-hover:border-zinc-700/50 transition-all duration-300 ease-out h-full">
            <CardHeader className="pb-4">
              <CardDescription className="flex items-center gap-2">
                {platform === "Codeforces" && <CodeforcesIcon className="w-5 h-5" />}
                {platform === "CodeChef" && <CodeChefIcon className="w-5 h-5" />}
                {platform === "CSES" && <CsesIcon className="w-5 h-5" />}
                {platform === "LeetCode" && <LeetCodeIcon className="w-5 h-5" />}
                {platform}
              </CardDescription>
              <div className="mt-2 flex items-center justify-between">
                <CardTitle className="text-xl font-medium">
                  <span className="text-zinc-100 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                    {handle}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </span>
                </CardTitle>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to remove your ${platform} handle?`)) {
                      removeMutation.mutate();
                    }
                  }}
                  disabled={removeMutation.isPending}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Remove Handle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
