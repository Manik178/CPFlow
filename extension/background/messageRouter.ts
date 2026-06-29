import type { ExtensionRequest, ExtensionResponse } from "../shared/types";
import { NotificationManager } from "./notificationManager";

export function handleRelayToPlatform(
  request: ExtensionRequest,
  sendResponse: (res: ExtensionResponse) => void
) {
  const { problemUrl, action } = request;

  if (!problemUrl) {
    sendResponse({ success: false, error: "problemUrl is missing from request" });
    return;
  }

  // Find the tab that matches the problem URL
  chrome.tabs.query({}, (tabs) => {
    const normalizeUrl = (url: string) => {
      if (!url) return "";
      let u = url.split("?")[0].split("#")[0];
      if (u.endsWith("/")) u = u.slice(0, -1);
      // Remove http/https to be safe
      u = u.replace(/^https?:\/\//, "");
      return u;
    };

    const targetTab = tabs.find((t) => {
      if (!t.url) return false;
      return normalizeUrl(t.url) === normalizeUrl(problemUrl);
    });

    if (targetTab && targetTab.id) {
      chrome.tabs.sendMessage(
        targetTab.id,
        request,
        (response: ExtensionResponse) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            // Trigger notifications based on action and response
            if (response && response.success) {
              if (action === "SUBMIT") {
                NotificationManager.notifySuccess("Your solution has been submitted.");
              }
            } else if (response && !response.success && action === "SUBMIT") {
              NotificationManager.notifyError(response.error || "Submission failed due to an error.");
            }
            sendResponse(response || { success: true });
          }
        }
      );
    } else {
      console.error("CPFlow: Could not find active tab for", problemUrl);
      sendResponse({
        success: false,
        error: "Tab not found. Make sure the problem tab is still open.",
      });
    }
  });
}
