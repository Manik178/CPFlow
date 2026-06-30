"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { subDays, format, getDay, isSameMonth } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CumulativeHeatmap({ profile }: { profile: any }) {
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

  // Merge the heatmaps
  const mergedHeatmap: Record<string, number> = {}

  if (cfQuery.data?.heatmap) {
    for (const h of cfQuery.data.heatmap) {
      mergedHeatmap[h.date] = (mergedHeatmap[h.date] || 0) + h.count
    }
  }

  if (lcQuery.data?.heatmap) {
    for (const h of lcQuery.data.heatmap) {
      mergedHeatmap[h.date] = (mergedHeatmap[h.date] || 0) + h.count
    }
  }

  // Generate the last 365 days
  const today = new Date()
  const last365Days = Array.from({ length: 365 }).map((_, i) => {
    return subDays(today, 364 - i)
  })

  // Pad the beginning so the first day aligns with its proper day of the week
  // Sunday = 0, Monday = 1
  const firstDayOfWeek = getDay(last365Days[0])
  const paddingDays = Array.from({ length: firstDayOfWeek }).map((_, i) => null)

  const allDays = [...paddingDays, ...last365Days]
  let totalSubmissions = 0
  Object.values(mergedHeatmap).forEach(v => totalSubmissions += v)

  // Generate month labels
  const months: { label: string; colSpan: number }[] = []
  let currentMonth = ""
  let currentMonthCols = 0

  const numCols = Math.ceil(allDays.length / 7)
  for (let c = 0; c < numCols; c++) {
    // Determine the month for this column by checking the middle of the week
    const date = allDays[c * 7 + 3] || allDays[c * 7 + 6]
    const monthStr = date ? format(date, "MMM") : ""

    if (monthStr !== currentMonth) {
      if (currentMonth) months.push({ label: currentMonth, colSpan: currentMonthCols })
      currentMonth = monthStr
      currentMonthCols = 1
    } else {
      currentMonthCols++
    }
  }
  if (currentMonth) months.push({ label: currentMonth, colSpan: currentMonthCols })

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/50 mt-6 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{totalSubmissions.toLocaleString()} submissions in the past one year</CardTitle>
        <CardDescription>Codeforces and LeetCode combined</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <TooltipProvider delay={0}>
          <div className="flex flex-col gap-2 min-w-max">
            {/* Month Labels */}
            <div className="flex text-xs text-zinc-500" style={{ marginLeft: '28px' }}>
              {months.map((m, i) => (
                <div key={i} className="flex-shrink-0 overflow-hidden" style={{ width: `${m.colSpan * 15}px`, minWidth: `${m.colSpan * 15}px` }}>
                  {m.colSpan > 1 ? m.label : ""}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Day Labels */}
              <div className="flex flex-col gap-[3px] text-[10px] text-zinc-500 mt-1 w-5">
                <span className="h-3 leading-3">Sun</span>
                <span className="h-3 leading-3 opacity-0">Mon</span>
                <span className="h-3 leading-3">Tue</span>
                <span className="h-3 leading-3 opacity-0">Wed</span>
                <span className="h-3 leading-3">Thu</span>
                <span className="h-3 leading-3 opacity-0">Fri</span>
                <span className="h-3 leading-3">Sat</span>
              </div>

              {/* Grid */}
              <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                {allDays.map((date, i) => {
                  if (!date) return <div key={`pad-${i}`} className="w-3 h-3" />
                  
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const count = mergedHeatmap[dateStr] || 0
                  
                  let bg = "bg-zinc-800"
                  if (count > 0) bg = "bg-[#0e4429]"
                  if (count >= 3) bg = "bg-[#006d32]"
                  if (count >= 6) bg = "bg-[#26a641]"
                  if (count >= 10) bg = "bg-[#39d353]"

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger render={<div className={`w-3 h-3 rounded-sm ${bg} hover:ring-1 hover:ring-white transition-all`} />} />
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                        <p><strong>{count} submissions</strong> on {format(date, 'MMM d, yyyy')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-zinc-500">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-zinc-800" />
              <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
              <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
              <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
              <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
