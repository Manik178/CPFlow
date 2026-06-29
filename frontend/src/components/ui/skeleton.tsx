import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-800/50 dark:bg-zinc-800/30", className)}
      {...props}
    />
  )
}

export { Skeleton }
