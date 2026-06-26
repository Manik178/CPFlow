"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function CodeChefAnalytics({ handle }: { handle: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cc_analytics", handle],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/analytics/codechef/${handle}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-xl border-zinc-800/50 bg-zinc-900/20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (isError || !data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-bold font-outfit">CodeChef Analytics</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-orange-500/10 text-orange-500 font-medium whitespace-nowrap">
            {handle} • Rating: {data.rating}
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-emerald-500/10 text-emerald-400 font-medium whitespace-nowrap">
            {data.totalSolved} Solved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/50">
          <CardHeader>
            <CardTitle>Global Rank</CardTitle>
            <CardDescription>CodeChef leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-zinc-100">{data.rank}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/40 border-zinc-800/50">
          <CardHeader>
            <CardTitle>Total Solved</CardTitle>
            <CardDescription>Problems fully solved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-zinc-100">{data.totalSolved}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
