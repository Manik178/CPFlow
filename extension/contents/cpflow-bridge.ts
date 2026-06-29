import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:3000/*"]
}

// Guard: check if extension context is still valid before messaging
function isExtensionValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

// Listen for messages emitted by the CPFlow web application
window.addEventListener("message", (event) => {
  // We only accept messages from our own window
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
    
    // Forward the message to the background script
    chrome.runtime.sendMessage(requestMessage, (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage({
          type: "CPFLOW_EXTENSION_RESPONSE",
          messageId: messageId,
          response: { success: false, error: chrome.runtime.lastError.message }
        }, "*")
        return
      }
      // Send the response back to the web app
      window.postMessage({
        type: "CPFLOW_EXTENSION_RESPONSE",
        messageId: messageId,
        response: response
      }, "*")
    })
  }
})
