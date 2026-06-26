export interface ScrapedProblem {
  title: string
  url: string
  platform: "Codeforces" | "CSES"
  statement_html: string
  time_limit: number | null
  memory_limit: number | null
  tags: string[]
  difficulty: string | null
  samples: { input: string; output: string }[]
}
