import type { ScrapedProblem } from "./types"
import { cleanProblemHTML } from "./utils"

export function scrapeCodeforces(): ScrapedProblem {
  // Title: e.g. "A. Satisfying Constraints"
  const titleEl = document.querySelector(".title")
  const title = titleEl?.textContent?.trim() ?? document.title

  // Time limit: "time limit per test: 2 seconds"
  const timeLimitEl = document.querySelector(".time-limit")
  const timeLimitText = timeLimitEl?.textContent ?? ""
  const timeMatch = timeLimitText.match(/([\d.]+)\s*second/)
  const time_limit = timeMatch ? parseFloat(timeMatch[1]) : null

  // Memory limit: "memory limit per test: 256 megabytes"
  const memoryLimitEl = document.querySelector(".memory-limit")
  const memoryLimitText = memoryLimitEl?.textContent ?? ""
  const memMatch = memoryLimitText.match(/(\d+)\s*megabyte/)
  const memory_limit = memMatch ? parseInt(memMatch[1]) : null

  // Problem statement: the main div containing the problem body
  const statementEl = document.querySelector(".problem-statement")
  // Clone to avoid modifying the actual page
  const clone = statementEl?.cloneNode(true) as HTMLElement | null

  // Remove the input/output specification divs, sample-tests, and header from the statement clone
  // so we can handle samples separately and avoid duplicating title/limits
  const sampleSection = clone?.querySelector(".sample-tests")
  sampleSection?.remove()
  
  const headerSection = clone?.querySelector(".header")
  headerSection?.remove()

  if (clone) {
    cleanProblemHTML(clone)
  }

  const statement_html = clone?.innerHTML ?? ""

  // Samples: each .sample-test has .input and .output with <pre> blocks
  const sampleTests = document.querySelectorAll(".sample-test")
  const samples: { input: string; output: string }[] = []

  const extractTextWithNewlines = (el: Element | null) => {
    if (!el) return ""
    const clone = el.cloneNode(true) as HTMLElement
    // Replace <br> with newlines
    clone.querySelectorAll("br").forEach(br => br.replaceWith("\n"))
    // Replace divs with their text content + newline
    clone.querySelectorAll("div").forEach(div => div.replaceWith((div.textContent ?? "") + "\n"))
    return clone.textContent?.trim() ?? ""
  }

  const inputs = document.querySelectorAll(".sample-tests .input pre")
  const outputs = document.querySelectorAll(".sample-tests .output pre")

  for (let i = 0; i < inputs.length && i < outputs.length; i++) {
    const input = extractTextWithNewlines(inputs[i])
    const output = extractTextWithNewlines(outputs[i])
    if (input || output) { // Sometimes output can be empty
      samples.push({ input, output })
    }
  }

  // Tags
  const tagEls = document.querySelectorAll(".tag-box")
  const tags = Array.from(tagEls).map((el) => el.textContent?.trim() ?? "")

  // Difficulty (rating) — shown as "*1200" etc.
  const ratingEl = document.querySelector(".tag-box[title='Difficulty']") ??
    Array.from(document.querySelectorAll(".tag-box")).find((el) =>
      el.textContent?.trim().startsWith("*")
    )
  const difficulty = ratingEl?.textContent?.trim().replace("*", "") ?? null

  return {
    title,
    url: window.location.href,
    platform: "Codeforces",
    statement_html,
    time_limit,
    memory_limit,
    tags: tags.filter((t) => !t.startsWith("*")), // exclude the rating tag
    difficulty,
    samples,
  }
}
