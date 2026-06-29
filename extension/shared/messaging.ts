import type { ExtensionRequest, ExtensionResponse } from "./types";

export const messaging = {
  async send(request: ExtensionRequest): Promise<ExtensionResponse> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(request, (response: ExtensionResponse) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: false, error: "Empty response from background script" });
        }
      });
    });
  }
};
