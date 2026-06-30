"use client"

import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function CumulativeAnalytics({ profile }: { profile: any }) {
  const cfQuery = useQuery({
    queryKey: ["cf_analytics", profile?.handles?.codeforces],
    queryFn: async () => {
      if (!profile?.handles?.codeforces) return null
      const res = await fetch(`${""}/api/analytics/codeforces/${profile.handles.codeforces}`)
      return res.json()
    },
    enabled: !!profile?.handles?.codeforces
  })

  const lcQuery = useQuery({
    queryKey: ["lc_analytics", profile?.handles?.leetcode],
    queryFn: async () => {
      if (!profile?.handles?.leetcode) return null
      const res = await fetch(`${""}/api/analytics/leetcode/${profile.handles.leetcode}`)
      return res.json()
    },
    enabled: !!profile?.handles?.leetcode
  })

  const ccQuery = useQuery({
    queryKey: ["cc_analytics", profile?.handles?.codechef],
    queryFn: async () => {
      if (!profile?.handles?.codechef) return null
      const res = await fetch(`${""}/api/analytics/codechef/${profile.handles.codechef}`)
      return res.json()
    },
    enabled: !!profile?.handles?.codechef
  })

  const isLoading = cfQuery.isLoading || lcQuery.isLoading || ccQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-xl border-zinc-800/50 bg-zinc-900/20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  const cfSolved = cfQuery.data?.totalSolved || 0
  const lcSolved = lcQuery.data?.totalSolved || 0
  const ccSolved = ccQuery.data?.totalSolved || 0
  
  const totalSolved = cfSolved + lcSolved + ccSolved

  const chartData = [
    { name: "Codeforces", value: cfSolved, fill: "#3b82f6" },
    { name: "LeetCode", value: lcSolved, fill: "#eab308" },
    { name: "CodeChef", value: ccSolved, fill: "#f97316" }
  ].filter(d => d.value > 0)

  if (totalSolved === 0) return null

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/50">
      <CardHeader>
        <CardTitle>Cumulative Progress</CardTitle>
        <CardDescription>Total problems solved across all connected platforms</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-center gap-12 py-4">
        <div className="relative h-[220px] w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold font-outfit text-white">{totalSolved}</span>
            <span className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Solved</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-[200px]">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                <span className="text-zinc-300 font-medium">{d.name}</span>
              </div>
              <span className="text-white font-bold">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
