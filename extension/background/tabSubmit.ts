import { resolveCodeforcesSubmitTarget } from "../utils/urlParser";
import type { ExtensionRequest, ExtensionResponse } from "../shared/types";

export async function handleTabAutomationSubmit(
  request: ExtensionRequest,
  sendResponse: (res: ExtensionResponse) => void
) {
  const { problemUrl, data } = request;
  if (!problemUrl || !data) {
    sendResponse({ success: false, error: "Missing problemUrl or data" });
    return;
  }

  const { code, languageId } = data;
  const { submitUrl, problemIndex } = resolveCodeforcesSubmitTarget(problemUrl);

  try {
    // 1. Create tab
    const tab = await chrome.tabs.create({ url: submitUrl, active: true });
    if (!tab || !tab.id) throw new Error("Failed to create submission tab");
    const tabId = tab.id;

    // 2. Linear retry loop for injection (handles Cloudflare and slow loads)
    let injected = false;
    let attempts = 0;
    while (!injected && attempts < 10) {
      attempts++;
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: async (sourceCode: string, langId: string, probIndex: string) => {
            return new Promise((resolve) => {
              let checks = 0;
              const interval = setInterval(() => {
                checks++;
                
                // Cloudflare check
                if (document.title.includes("Just a moment")) {
                  clearInterval(interval);
                  resolve({ status: "cloudflare" });
                  return;
                }
                
                // Login check
                if (window.location.href.includes("/enter")) {
                  clearInterval(interval);
                  resolve({ status: "unauthorized" });
                  return;
                }

                const submitBtn = document.querySelector(".submit") as HTMLButtonElement | null;
                const sourceEl = document.getElementById("sourceCodeTextarea") as HTMLTextAreaElement | null;
                const langSelect = document.querySelector('select[name="programTypeId"]') as HTMLSelectElement | null;

                if (submitBtn && sourceEl && langSelect) {
                  clearInterval(interval);
                  
                  // Fill Language
                  const options = Array.from(langSelect.options);
                  let mappedLang = langId;
                  if (!options.some(o => o.value === langId)) {
                    if (langId.toLowerCase().includes("cpp") || langId.toLowerCase().includes("c++")) {
                      const opt = options.find(o => o.text.includes("C++20")) || options.find(o => o.text.includes("C++17")) || options.find(o => o.text.includes("G++"));
                      if (opt) mappedLang = opt.value;
                    } else if (langId.toLowerCase().includes("py")) {
                      const opt = options.find(o => o.text.includes("PyPy 3")) || options.find(o => o.text.includes("Python 3"));
                      if (opt) mappedLang = opt.value;
                    } else if (langId.toLowerCase().includes("java")) {
                      const opt = options.find(o => o.text.includes("Java 21")) || options.find(o => o.text.includes("Java 17")) || options.find(o => o.text.includes("Java 11"));
                      if (opt) mappedLang = opt.value;
                    }
                  }
                  langSelect.value = mappedLang;
                  
                  // Fill Code
                  sourceEl.value = sourceCode;

                  // Fill Problem Index if needed
                  if (probIndex) {
                    const probEl = document.querySelector('input[name="submittedProblemIndex"]') as HTMLInputElement | null;
                    if (probEl) probEl.value = probIndex;
                  }

                  // Click Submit
                  submitBtn.disabled = false;
                  submitBtn.click();
                  resolve({ status: "submitted" });
                } else if (checks > 10) { // 5 seconds polling per inject
                  clearInterval(interval);
                  resolve({ status: "timeout" });
                }
              }, 500);
            });
          },
          args: [code, languageId, problemIndex]
        });

        const res = results[0].result as { status: string };
        if (res.status === "submitted") {
          injected = true;
          break;
        } else if (res.status === "unauthorized") {
          chrome.tabs.remove(tabId);
          return sendResponse({ success: false, error: "You are not logged in to Codeforces. Please log in first." });
        } else if (res.status === "cloudflare") {
          // Wait 3 seconds and retry injection (let Cloudflare redirect)
          await new Promise(r => setTimeout(r, 3000));
        } else {
          // Timeout, try injecting again just in case DOM completely rebuilt
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        // "Context invalidated" happens when page navigates (e.g. Cloudflare -> Real page)
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!injected) {
      chrome.tabs.remove(tabId);
      return sendResponse({ success: false, error: "Failed to find submit form after multiple attempts. Is Codeforces down?" });
    }

    // 3. Wait for Navigation (Success or Validation Error)
    let navResolved = false;
    const checkNav = async () => {
      let checks = 0;
      while (!navResolved && checks < 20) { // Check for up to 20 seconds
        await new Promise(r => setTimeout(r, 1000));
        checks++;
        
        try {
          const navResults = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              const url = window.location.href;
              if (url.includes("/my") || url.includes("/status")) {
                const row = document.querySelector("tr[data-submission-id]");
                return { done: true, type: "success", id: row ? row.getAttribute("data-submission-id") : null };
              } else if (url.includes("/submit")) {
                const err = document.querySelector("span.error");
                if (err) return { done: true, type: "error", msg: err.textContent };
              }
              return { done: false };
            }
          });
          
          const navRes = navResults[0].result as { done: boolean, type?: string, id?: string, msg?: string };
          if (navRes.done) {
            navResolved = true;
            chrome.tabs.remove(tabId);
            if (navRes.type === "success") {
              return sendResponse({ success: true, submissionId: navRes.id || undefined });
            } else {
              return sendResponse({ success: false, error: navRes.msg || "Submission rejected." });
            }
          }
        } catch (e) {
          // Ignore context invalidated during navigation
        }
      }
      
      if (!navResolved) {
        chrome.tabs.remove(tabId);
        return sendResponse({ success: false, error: "Timed out waiting for submission result from Codeforces." });
      }
    };
    
    checkNav();

  } catch (err: any) {
    sendResponse({ success: false, error: err.message });
  }
}
