import type { PlasmoCSConfig } from "plasmo"
import { scrapeProblem } from "./scrapers"
import { useState } from "react"

export const config: PlasmoCSConfig = {
  matches: [
    "https://codeforces.com/contest/*/problem/*",
    "https://codeforces.com/problemset/problem/*/*",
    "https://codeforces.com/problemset/gymProblem/*/*",
    "https://codeforces.com/gym/*/problem/*",
    "https://codeforces.com/group/*/contest/*/problem/*",
    "https://cses.fi/problemset/task/*"
  ]
}

const CPFLOW_URL = "http://localhost:3000"
const API_URL = "http://localhost:8000"

// Listen for submission requests from CPFlow background worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SUBMIT_CODE") {
    const { code, language } = request.data
    const url = window.location.href

    if (url.includes("codeforces.com")) {
      submitToCodeforces(code, language, sendResponse)
    } else {
      sendResponse({ success: false, error: "Auto-submit not supported for this platform yet." })
    }
    return true // async
  }
})

function submitToCodeforces(code: string, language: string, sendResponse: (res: any) => void) {
  try {
    const csrfTokenMeta = document.querySelector('meta[name="X-Csrf-Token"]') as HTMLMetaElement
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : ""

    // Codeforces language mapping: 54 is GCC 12, 70 is Python 3
    const programTypeId = language === "cpp" ? "54" : language === "python" ? "70" : "60"

    // To submit silently, we can fill the form if it exists on the page
    const form = document.querySelector("form.submit-form") as HTMLFormElement | null
    if (form) {
      const sourceInput = form.querySelector('textarea[name="source"]') as HTMLTextAreaElement
      const langSelect = form.querySelector('select[name="programTypeId"]') as HTMLSelectElement
      
      if (sourceInput && langSelect) {
        sourceInput.value = code
        langSelect.value = programTypeId
        
        // Trigger submit
        form.submit()
        sendResponse({ success: true, message: "Codeforces submission initiated!" })
        return
      }
    }
    
    sendResponse({ success: false, error: "Could not find Codeforces submit form on this page." })
  } catch (err) {
    sendResponse({ success: false, error: String(err) })
  }
}

export default function CPFlowOverlay() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleOpenInCPFlow = async () => {
    setStatus("loading")
    try {
      const problem = scrapeProblem()
      if (!problem) {
        setStatus("error")
        return
      }

      // Send to backend — it caches in Redis and returns a problem_id
      const res = await fetch(`${API_URL}/api/problems/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problem),
      })

      if (!res.ok) throw new Error("Backend error")
      const data = await res.json()

      setStatus("success")

      // Open CPFlow workspace with the problem_id
      window.open(`${CPFLOW_URL}/workspace?pid=${data.problem_id}`, "_blank")
    } catch (e) {
      console.error("CPFlow scraping error:", e)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}>
      <button
        onClick={handleOpenInCPFlow}
        disabled={status === "loading"}
        style={{
          background: status === "success"
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : status === "error"
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #3b82f6, #10b981)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "9999px",
          fontWeight: 600,
          cursor: status === "loading" ? "wait" : "pointer",
          boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.08)",
          fontSize: "14px",
          letterSpacing: "-0.01em",
          transition: "all 0.2s ease",
          opacity: status === "loading" ? 0.8 : 1,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
        {status === "loading" ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
            Scraping...
          </>
        ) : status === "success" ? (
          <>✅ Opened!</>
        ) : status === "error" ? (
          <>❌ Failed</>
        ) : (
          <>⚡ Open in CPFlow</>
        )}
      </button>
    </div>
  )
}
