"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Clock, ExternalLink } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export function ContestsClient() {
  const { data: contests, isLoading, isError } = useQuery({
    queryKey: ["upcoming_contests"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/contests/`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    refetchInterval: 1000 * 60 // Refetch every minute to keep countdowns accurate
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-4xl font-outfit font-bold tracking-tight">Contest Tracker</h1>
        <p className="mt-2 text-lg text-muted-foreground">Upcoming competitive programming contests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 border rounded-xl border-zinc-800/50 bg-zinc-900/20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load contests. Is the backend running?</p>
      ) : contests?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming contests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests?.map((contest: any) => {
            const startDate = new Date(contest.startTime * 1000)
            const hours = Math.floor(contest.durationSeconds / 3600)
            const isSoon = startDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 // less than 24 hours

            return (
              <Card 
                key={contest.id} 
                className={`bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900/80 transition-colors ${isSoon ? 'ring-1 ring-blue-500/50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg leading-tight group">
                      <a href={contest.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex gap-2">
                        {contest.name}
                        <ExternalLink className="w-4 h-4 opacity-50 shrink-0 mt-1" />
                      </a>
                    </CardTitle>
                    <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 font-medium shrink-0">
                      {contest.platform}
                    </span>
                  </div>
                  <CardDescription className="font-medium text-emerald-400">
                    Starts {formatDistanceToNow(startDate, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-70" />
                    {format(startDate, 'MMM d, yyyy • h:mm a')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-70" />
                    {hours} hour{hours > 1 ? 's' : ''} duration
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
