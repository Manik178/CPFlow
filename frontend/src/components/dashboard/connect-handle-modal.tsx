"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"

export function ConnectHandleModal({ userId, platform, color }: { userId: string, platform: string, color: string }) {
  const [open, setOpen] = useState(false)
  const [handle, setHandle] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const queryClient = useQueryClient()

  const platformKey = platform.toLowerCase()

  const mutation = useMutation({
    mutationFn: async (newHandle: string) => {
      const apiUrl = ""
      
      // First fetch current profile
      const currentRes = await fetch(`${apiUrl}/api/users/profile`)
      if (!currentRes.ok) throw new Error("Failed to fetch profile")
      const currentProfile = await currentRes.json()

      // Then PUT updated profile
      const updatedHandles = {
        ...currentProfile.handles,
        [platformKey]: newHandle
      }

      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handles: updatedHandles,
          preferences: currentProfile.preferences
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to update handle")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
      setOpen(false)
      setHandle("")
      setErrorMsg("")
    },
    onError: (error) => {
      setErrorMsg(error.message)
    }
  })

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return
    mutation.mutate(handle.trim())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className={`mt-2 rounded-full border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 ${color}`} />
      }>
        <Plus className="w-3 h-3 mr-1" /> Connect
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Connect {platform}</DialogTitle>
          <DialogDescription>
            Enter your {platform} handle to sync your stats and progress to CPFlow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConnect} className="grid gap-4 py-4">
          {errorMsg && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {errorMsg}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="handle"
              placeholder="e.g. tourist"
              className="col-span-4 bg-zinc-900 border-zinc-800"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending || !handle.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
