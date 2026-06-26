import { useState, useEffect } from "react"

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? ""
      setCurrentUrl(url)
      setIsSupported(
        url.includes("codeforces.com") ||
        url.includes("cses.fi")
      )
    })
  }, [])

  const platformColor = currentUrl.includes("codeforces")
    ? "#3b82f6"
    : currentUrl.includes("cses")
      ? "#10b981"
      : "#71717a"

  return (
    <div
      style={{
        width: 320,
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        background: "#09090b",
        color: "#fafafa",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            background: "linear-gradient(135deg, #3b82f6, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}>
          CPFlow
        </h1>
      </div>

      <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.5, margin: "0 0 20px 0" }}>
        Navigate to a problem on Codeforces or CSES and click the floating button to open it in CPFlow.
      </p>

      <div
        style={{
          padding: 12,
          borderRadius: 10,
          background: "#18181b",
          border: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isSupported ? "#22c55e" : "#71717a",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, color: isSupported ? "#d4d4d8" : "#71717a" }}>
          {isSupported
            ? `Supported platform detected`
            : "Navigate to a supported problem page"}
        </span>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Codeforces", "CSES"].map((p) => (
          <span
            key={p}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 99,
              background: "#27272a",
              color: "#a1a1aa",
              fontWeight: 500,
            }}>
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

export default IndexPopup
