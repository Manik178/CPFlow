import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "https://codeforces.com/contest/*/problem/*",
    "https://codeforces.com/problemset/problem/*",
    "https://cses.fi/problemset/task/*"
  ]
}

export default function CPFlowOverlay() {
  const handleOpenInCPFlow = async () => {
    try {
      // In a full implementation, we would extract specific DOM elements based on the platform
      const problemData = {
        title: document.title,
        url: window.location.href,
        platform: window.location.hostname.includes("codeforces") ? "Codeforces" : "CSES",
        statement_html: "Mock extracted content" // Placeholder
      }

      // We'd send this to our API
      // await fetch("http://localhost:8000/api/problems/import", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(problemData)
      // })

      // Open the CPFlow Workspace
      window.open("http://localhost:3000/workspace", "_blank")
    } catch (e) {
      console.error("CPFlow scraping error", e)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 99999
      }}>
      <button
        onClick={handleOpenInCPFlow}
        style={{
          background: "linear-gradient(to right, #60a5fa, #34d399)",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "9999px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2)",
          fontFamily: "sans-serif",
          fontSize: "14px"
        }}>
        ⚡ Open in CPFlow
      </button>
    </div>
  )
}
