import { resolveCodeforcesSubmitTarget } from "../utils/urlParser";
import type { ExtensionRequest, ExtensionResponse } from "../shared/types";

export function handleTabAutomationSubmit(
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

  // 1. Create tab to submit code
  chrome.tabs.create({ url: submitUrl, active: false }, (tab) => {
    if (!tab || !tab.id) {
      sendResponse({ success: false, error: "Failed to create submission tab" });
      return;
    }

    const tabId = tab.id;
    let hasInjected = false;
    let hasSubmitted = false;

    // 2. Wait for it to load
    const loadListener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo, tabNode: chrome.tabs.Tab) => {
      if (updatedTabId === tabId && changeInfo.status === "complete" && tabNode.url && tabNode.url.includes("codeforces.com") && !hasInjected) {
        hasInjected = true;
        
        // 3. Inject submit script after a brief buffer for Codeforces JS to initialize
        setTimeout(() => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              func: (sourceCode: string, langId: string, probIndex: string) => {
                // Map the language ID similar to our headless logic
                const langSelect = document.querySelector('select[name="programTypeId"]') as HTMLSelectElement | null;
                if (langSelect) {
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
                }
                
                const sourceEl = document.getElementById("sourceCodeTextarea") as HTMLTextAreaElement | null;
                if (sourceEl) sourceEl.value = sourceCode;

                if (probIndex) {
                  const probEl = document.querySelector('input[name="submittedProblemIndex"]') as HTMLInputElement | null;
                  if (probEl) probEl.value = probIndex;
                }

                const submitBtn = document.querySelector(".submit") as HTMLButtonElement | null;
                if (submitBtn) {
                  submitBtn.disabled = false;
                  submitBtn.click();
                  return { success: true };
                }
                return { success: false, url: window.location.href, title: document.title };
              },
              args: [code, languageId, problemIndex]
            },
            (results) => {
              if (chrome.runtime.lastError) {
                hasInjected = false;
              } else if (results && results[0] && results[0].result) {
                const res = results[0].result;
                if (res.success) {
                  hasSubmitted = true;
                  hasInjected = true;
                } else {
                  if (res.url && res.url.includes("/enter")) {
                    chrome.tabs.remove(tabId);
                    sendResponse({ success: false, error: "You are not logged in to Codeforces. Please log in first." });
                  } else if (res.title && res.title.includes("Just a moment")) {
                    // Cloudflare challenge. Reset and wait for the real page.
                    hasInjected = false;
                  } else {
                    // Abort so we don't hang until the 60s timeout
                    chrome.tabs.remove(tabId);
                    sendResponse({ success: false, error: `Could not find the submit form. Are you sure you have permission to submit here? (Page: ${res.title})` });
                  }
                }
              }
            }
          );
        }, 1000);
      }
    };
    chrome.tabs.onUpdated.addListener(loadListener);

    // 4. Wait for redirect to /my or /status, OR back to /submit on error
    const navListener = (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
      if (details.tabId === tabId && details.frameId === 0) {
        if (details.url.includes("/my") || details.url.includes("/status")) {
          chrome.webNavigation.onCompleted.removeListener(navListener);
          chrome.tabs.onUpdated.removeListener(loadListener);
          
          // 5. Scrape submissionId and close tab
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                func: () => {
                  const row = document.querySelector("tr[data-submission-id]");
                  return row ? row.getAttribute("data-submission-id") : null;
                }
              },
              (results) => {
                chrome.tabs.remove(tabId);
                if (results && results[0] && results[0].result) {
                  sendResponse({ success: true, submissionId: results[0].result });
                } else {
                  // If it fails to extract, just close the tab and return success without ID (graceful degradation)
                  sendResponse({ success: false, error: "Failed to extract submission ID after redirect. Did it compile?" });
                }
              }
            );
          }, 1500); // 1.5s wait for table to render completely
        } else if (hasSubmitted && details.url.includes("/submit")) {
          // Codeforces returned a validation error (e.g. "Same code submitted")
          chrome.webNavigation.onCompleted.removeListener(navListener);
          chrome.tabs.onUpdated.removeListener(loadListener);
          
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                func: () => {
                  const errorSpan = document.querySelector("span.error");
                  return errorSpan ? errorSpan.textContent : "Unknown submission error from Codeforces.";
                }
              },
              (results) => {
                chrome.tabs.remove(tabId);
                const errorMsg = (results && results[0] && results[0].result) ? results[0].result : "Submission rejected by Codeforces.";
                sendResponse({ success: false, error: errorMsg });
              }
            );
          }, 500);
        }
      }
    };
    chrome.webNavigation.onCompleted.addListener(navListener);
  });
}
