import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:3000/*"]
}

// Listen for messages emitted by the CPFlow web application
window.addEventListener("message", (event) => {
  // We only accept messages from our own window
  if (event.source !== window) return
  
  if (event.data && event.data.type === "CPFLOW_SUBMIT") {
    // Forward the message to the background script
    chrome.runtime.sendMessage({
      action: "RELAY_TO_PLATFORM",
      data: event.data.data
    }, (response) => {
      // Send the response back to the web app
      window.postMessage({
        type: "CPFLOW_SUBMIT_RESPONSE",
        response: response
      }, "*")
    })
  }
})
