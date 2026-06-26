import type { ScrapedProblem } from "./types"
import { cleanProblemHTML } from "./utils"

export function scrapeCSES(): ScrapedProblem {
  // Title: .title-block h1 on CSES
  const titleEl = document.querySelector(".title-block h1") ??
    document.querySelector("h1")
  const title = titleEl?.textContent?.trim() ?? document.title

  // Time and memory limits: shown in .header-list as "Time limit: 1.00 s" / "Memory limit: 512 MB"
  let time_limit: number | null = null
  let memory_limit: number | null = null

  const headerItems = document.querySelectorAll(".task-constraints li, .header-list li")
  headerItems.forEach((li) => {
    const text = li.textContent ?? ""
    const timeMatch = text.match(/Time limit:\s*([\d.]+)\s*s/)
    if (timeMatch) time_limit = parseFloat(timeMatch[1])
    const memMatch = text.match(/Memory limit:\s*(\d+)\s*MB/)
    if (memMatch) memory_limit = parseInt(memMatch[1])
  })

  // Problem statement: .content or the main task div
  const contentEl = document.querySelector(".content") ??
    document.querySelector("#task-statement")
  const clone = contentEl?.cloneNode(true) as HTMLElement | null

  // Remove sample section and everything after it from cloned statement
  const exampleSection = clone?.querySelector("#example") ??
    clone?.querySelector(".sample")

  if (exampleSection) {
    let curr = exampleSection.nextSibling
    while (curr) {
      const next = curr.nextSibling
      curr.remove()
      curr = next
    }
    exampleSection.remove()
  }

  if (clone) {
    cleanProblemHTML(clone)
  }

  const statement_html = clone?.innerHTML ?? ""

  // Samples: CSES uses a simple <pre> based format under #example or similar
  const samples: { input: string; output: string }[] = []
  const allPres = document.querySelectorAll("pre")
  // CSES pairs input/output <pre> tags sequentially
  for (let i = 0; i < allPres.length - 1; i += 2) {
    samples.push({
      input: allPres[i].textContent?.trim() ?? "",
      output: allPres[i + 1].textContent?.trim() ?? "",
    })
  }

  return {
    title,
    url: window.location.href,
    platform: "CSES",
    statement_html,
    time_limit,
    memory_limit,
    tags: [],
    difficulty: null,
    samples,
  }
}
