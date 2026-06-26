import type { ScrapedProblem } from "./types"
import { scrapeCodeforces } from "./codeforces"
import { scrapeCSES } from "./cses"


export function detectPlatform(): ScrapedProblem["platform"] | null {
  const host = window.location.hostname
  if (host.includes("codeforces.com")) return "Codeforces"
  if (host.includes("cses.fi")) return "CSES"
  return null
}

export function scrapeProblem(): ScrapedProblem | null {
  const platform = detectPlatform()
  if (!platform) return null

  switch (platform) {
    case "Codeforces":
      return scrapeCodeforces()
    case "CSES":
      return scrapeCSES()
    default:
      return null
  }
}

export type { ScrapedProblem }
