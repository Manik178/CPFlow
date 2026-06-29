import type { ExtensionRequest, ExtensionResponse } from "../../../../../extension/shared/types";

export const extensionService = {
  _sendRequest<T = any>(request: ExtensionRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      
      const handleResponse = (event: MessageEvent) => {
        if (event.source !== window || !event.data) return;
        if (event.data.type === "CPFLOW_EXTENSION_RESPONSE" && event.data.messageId === messageId) {
          window.removeEventListener("message", handleResponse);
          clearTimeout(timeoutId);
          
          const response: ExtensionResponse = event.data.response;
          if (response && response.success) {
            resolve(response.data as T);
          } else {
            reject(new Error(response?.error || "Unknown error"));
          }
        }
      };

      window.addEventListener("message", handleResponse);

      window.postMessage({ type: "CPFLOW_EXTENSION_REQUEST", messageId, request }, "*");

      const timeoutId = setTimeout(() => {
        window.removeEventListener("message", handleResponse);
        reject(new Error("Request timed out. Make sure the browser extension is installed and the problem tab is still open."));
      }, 15000);
    });
  },

  checkLogin(problemUrl: string): Promise<boolean> {
    return this._sendRequest<boolean>({ action: "CHECK_LOGIN", problemUrl });
  },

  getLanguages(problemUrl: string): Promise<{ id: string; name: string }[]> {
    return this._sendRequest<{ id: string; name: string }[]>({ action: "GET_LANGUAGES", problemUrl });
  },

  submitCode(code: string, languageId: string, problemUrl: string): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    return this._sendRequest({ action: "SUBMIT", problemUrl, data: { code, language: languageId } });
  },

  getVerdict(submissionId: string, problemUrl: string): Promise<any> {
    return this._sendRequest({ action: "GET_VERDICT", problemUrl, data: { submissionId } });
  },

  syncSolved(problemUrl: string): Promise<string[]> {
    return this._sendRequest<string[]>({ action: "SYNC_SOLVED", problemUrl });
  },
  
  detectProblem(problemUrl: string): Promise<any> {
    return this._sendRequest({ action: "DETECT_CURRENT_PROBLEM", problemUrl });
  }
};
