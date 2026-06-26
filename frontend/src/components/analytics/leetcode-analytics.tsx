"use client"

import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function LeetCodeAnalytics({ handle }: { handle: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lc_analytics", handle],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/analytics/leetcode/${handle}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-xl border-zinc-800/50 bg-zinc-900/20">
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
        <h2 className="text-2xl font-bold font-outfit">LeetCode Analytics</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-500 font-medium whitespace-nowrap">
            {handle} • Contest Rating: {data.rating}
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-emerald-500/10 text-emerald-400 font-medium whitespace-nowrap">
            {data.totalSolved} Solved
          </span>
        </div>
      </div>
      <Card className="bg-zinc-900/40 border-zinc-800/50">
        <CardHeader>
          <CardTitle>Difficulty Breakdown</CardTitle>
          <CardDescription>Solved problems by difficulty</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="h-[250px] w-full md:w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.difficultyDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.difficultyDistribution.map((d: any) => (
              <div key={d.name} className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-zinc-300 font-medium">{d.name}</span>
                </div>
                <span className="text-3xl font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
