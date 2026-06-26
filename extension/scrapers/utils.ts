export function cleanProblemHTML(clone: HTMLElement) {
  // 1. Remove hidden math assistive elements that cause duplicate text when rendered without their original CSS
  const duplicateMathSelectors = [
    ".MJX_Assistive_MathML", // MathJax 2
    ".katex-mathml",         // KaTeX
    "mjx-assistive-mml",     // MathJax 3
    ".MathJax_Preview",      // MathJax previews
    "script[type^='math/tex']" // Raw math scripts
  ]
  clone.querySelectorAll(duplicateMathSelectors.join(", ")).forEach(el => el.remove())

  // 2. Convert common competitive programming section headers to <h3> tags
  // This ensures the Tailwind @tailwindcss/typography (.prose) plugin styles them correctly
  const sectionTitleSelectors = [
    ".section-title", // Codeforces
    ".h2",            // Sometimes used as generic classes
    ".h3"
  ]
  clone.querySelectorAll(sectionTitleSelectors.join(", ")).forEach(el => {
    const h3 = document.createElement("h3")
    h3.innerHTML = el.innerHTML
    el.replaceWith(h3)
  })

  // CodeChef often uses bold tags or divs for Input/Output Format instead of true headings
  // We can promote <p><strong>Input Format</strong></p> or similar to <h3>
  clone.querySelectorAll("p, div").forEach(el => {
    const text = el.textContent?.trim().toLowerCase() || ""
    if (
      (text === "input format" || text === "output format" || text === "constraints" || text === "subtasks") &&
      el.children.length <= 1 && 
      (el.querySelector("strong") || el.querySelector("b") || el.tagName.toLowerCase() === "div")
    ) {
      const h3 = document.createElement("h3")
      h3.innerHTML = el.innerHTML
      el.replaceWith(h3)
    }
  })
}
