chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "RELAY_TO_PLATFORM") {
    const { problemUrl, code, language } = request.data

    // Find the tab that matches the problem URL
    chrome.tabs.query({}, (tabs) => {
      // Find a tab that roughly matches the problem URL (ignoring query params/hashes)
      const targetTab = tabs.find(t => t.url && t.url.split('?')[0].split('#')[0] === problemUrl.split('?')[0].split('#')[0])
      
      if (targetTab && targetTab.id) {
        chrome.tabs.sendMessage(targetTab.id, {
          action: "SUBMIT_CODE",
          data: { code, language }
        }, (response) => {
          sendResponse(response || { success: true })
        })
      } else {
        console.error("CPFlow: Could not find active tab for", problemUrl)
        sendResponse({ success: false, error: "Tab not found. Make sure the problem tab is still open." })
      }
    })
    
    // Return true to indicate we will send a response asynchronously
    return true
  }
})
