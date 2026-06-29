import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "http://localhost:3000/*",
    "https://cpflow.yourdomain.com/*" // Add production URL if available later
  ]
}

// Guard: check if extension context is still valid before messaging
function isExtensionValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

// Inject a tiny script or just listen directly on the content script side
window.addEventListener("message", (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return

  if (event.data && event.data.type === "CPFLOW_EXTENSION_REQUEST") {
    if (!isExtensionValid()) {
      window.postMessage({
        type: "CPFLOW_EXTENSION_RESPONSE",
        messageId: event.data.messageId,
        response: { success: false, error: "Extension was reloaded. Please refresh this page." }
      }, "*")
      return
    }

    const requestMessage = event.data.request;
    const messageId = event.data.messageId;
    
    // Relay to background script
    chrome.runtime.sendMessage(requestMessage, (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage({
          type: "CPFLOW_EXTENSION_RESPONSE",
          messageId: messageId,
          response: { success: false, error: chrome.runtime.lastError.message }
        }, "*")
        return
      }
      // Send response back to the workspace
      window.postMessage({
        type: "CPFLOW_EXTENSION_RESPONSE",
        messageId: messageId,
        response: response
      }, "*")
    })
  }
})
