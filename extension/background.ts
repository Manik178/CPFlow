import { handleRelayToPlatform } from "./background/messageRouter";
import type { ExtensionRequest } from "./shared/types";

chrome.runtime.onMessage.addListener((request: ExtensionRequest, sender, sendResponse) => {
  // We route all CPFlow bridge requests to the corresponding tab
  if (
    request.action === "SUBMIT" ||
    request.action === "CHECK_LOGIN" ||
    request.action === "GET_LANGUAGES" ||
    request.action === "GET_VERDICT" ||
    request.action === "GET_LATEST_SUBMISSION" ||
    request.action === "SYNC_SOLVED" ||
    request.action === "DETECT_CURRENT_PROBLEM"
  ) {
    handleRelayToPlatform(request, sendResponse);
    return true; // async
  }
});
