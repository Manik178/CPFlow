import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { scrapeProblem } from "./scrapers"
import { CodeforcesAdapter } from "./adapters/CodeforcesAdapter"
import { CsesAdapter } from "./adapters/CsesAdapter"
import type { ExtensionRequest } from "./shared/types"

export const config: PlasmoCSConfig = {
  matches: [
    "https://codeforces.com/*",
    "https://cses.fi/problemset/*"
  ]
}

const CPFLOW_URL = "http://localhost:3000"
const API_URL = "http://localhost:3000"

const cfAdapter = new CodeforcesAdapter();
const csesAdapter = new CsesAdapter();

function getAdapter(): import("./shared/types").JudgeAdapter | null {
  const url = window.location.href;
  if (url.includes("codeforces.com")) return cfAdapter;
  if (url.includes("cses.fi")) return csesAdapter;
  return null;
}

// Guard: check if extension context is still valid before messaging
function isExtensionValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((request: ExtensionRequest, sender, sendResponse) => {
  if (!isExtensionValid()) {
    return false;
  }

  const adapter = getAdapter();
  if (!adapter) {
    sendResponse({ success: false, error: "Platform not supported." });
    return true;
  }

  (async () => {
    try {
      let data = null;
      switch (request.action) {
        case "CHECK_LOGIN":
          data = await adapter.checkLogin();
          break;
        case "GET_LANGUAGES":
          data = await adapter.getLanguages();
          break;
        case "SUBMIT":
          const res = await adapter.submit(request.data.code, request.data.language, window.location.href);
          if (!res.success) throw new Error(res.error);
          data = res;
          break;
        case "GET_VERDICT":
          data = await adapter.getVerdict(request.data.submissionId, window.location.href);
          break;
        case "GET_LATEST_SUBMISSION":
          data = await adapter.getLatestSubmission(window.location.href);
          break;
        case "SYNC_SOLVED":
          data = await adapter.syncSolved();
          break;
        case "DETECT_CURRENT_PROBLEM":
          data = await adapter.detectProblem();
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }
      sendResponse({ success: true, data });
    } catch (e: any) {
      sendResponse({ success: false, error: e.message || String(e) });
    }
  })();

  return true; // async
});

export default function CPFlowOverlay() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Only render the overlay on actual problem pages (not submit/status pages)
  const isProblemPage = window.location.pathname.includes("/problem/") || window.location.pathname.includes("/task/")
  if (!isProblemPage) return null

  const handleOpenInCPFlow = async () => {
    setStatus("loading")
    try {
      const problem = scrapeProblem()
      if (!problem) {
        setStatus("error")
        return
      }

      const res = await fetch(`${API_URL}/api/problems/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problem),
      })

      if (!res.ok) throw new Error("Backend error")
      const data = await res.json()

      setStatus("success")
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

