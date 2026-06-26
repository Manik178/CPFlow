"use client"

import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts"
import { format, subDays, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16'];

export function CodeforcesAnalytics({ handle }: { handle: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cf_analytics", handle],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/analytics/codeforces/${handle}`)
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

  // Generate last 60 days for heatmap
  const today = new Date()
  const heatmapDates = Array.from({ length: 60 }).map((_, i) => {
    const d = subDays(today, 59 - i)
    return format(d, 'yyyy-MM-dd')
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-bold font-outfit">Codeforces Analytics</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-blue-500/10 text-blue-400 font-medium whitespace-nowrap">
            {handle} • {data.rating} ({data.rank})
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-emerald-500/10 text-emerald-400 font-medium whitespace-nowrap">
            {data.totalSolved} Solved
          </span>
        </div>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/50">
        <CardHeader>
          <CardTitle>Top Topics</CardTitle>
          <CardDescription>Based on your successfully solved problems</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-[250px] w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topicDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.topicDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            {data.topicDistribution.map((t: any, i: number) => (
              <div key={t.name} className="flex flex-col p-3 rounded-lg bg-zinc-900 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-zinc-300 text-sm font-medium capitalize">{t.name}</span>
                </div>
                <span className="text-xl font-bold text-white pl-5">{t.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
