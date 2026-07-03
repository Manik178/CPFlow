/**
 * Tab Automation Submit for Codeforces
 * 
 * This follows the exact same pattern as cph-submit:
 * 1. Create a tab to the Codeforces submit page
 * 2. Wait for the tab to finish loading (onUpdated status === 'complete')
 * 3. Inject a script file and send a message to fill the form
 * 
 * The key insight from cph-submit is that you MUST wait for onUpdated
 * before injecting/messaging, and the script runs in the content script
 * context where chrome.runtime.onMessage works.
 */

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

  // Frontend sends { code, language } — note: "language" not "languageId"
  const sourceCode = data.code;
  const languageId = data.language || data.languageId || "";
  const { submitUrl, problemIndex } = resolveCodeforcesSubmitTarget(problemUrl);

  console.log("[CPFlow tabSubmit] submitUrl:", submitUrl);
  console.log("[CPFlow tabSubmit] languageId:", languageId);
  console.log("[CPFlow tabSubmit] problemIndex:", problemIndex);
  console.log("[CPFlow tabSubmit] sourceCode length:", sourceCode?.length);

  // 1. Create tab (active: true, exactly like cph-submit)
  chrome.tabs.create({ url: submitUrl, active: true }, (tab) => {
    if (!tab || !tab.id) {
      sendResponse({ success: false, error: "Failed to create submission tab" });
      return;
    }

    const tabId = tab.id;

    // 2. Wait for tab to finish loading (exactly like cph-submit)
    chrome.tabs.onUpdated.addListener(
      function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          console.log("[CPFlow tabSubmit] Tab loaded, injecting script...");

          // 3. Wait a brief moment for page JS to initialize, then inject & message
          //    (cph-submit does this for AlgoZenith with a 2s delay)
          setTimeout(async () => {
            try {
              // Inject our submit helper script into the tab
              await chrome.scripting.executeScript({
                target: { tabId, allFrames: true },
                func: () => {
                  // Register a one-time message listener inside the tab
                  chrome.runtime.onMessage.addListener(
                    function submitHandler(message: any) {
                      if (message.type !== "cpflow-do-submit") return;
                      chrome.runtime.onMessage.removeListener(submitHandler);

                      console.log("[CPFlow injected] Received submit data:", message);

                      const languageEl = document.getElementsByName(
                        "programTypeId"
                      )[0] as HTMLSelectElement;
                      const sourceCodeEl = document.getElementById(
                        "sourceCodeTextarea"
                      ) as HTMLTextAreaElement;

                      if (!languageEl || !sourceCodeEl) {
                        console.error("[CPFlow injected] Form elements not found!");
                        return;
                      }

                      // Fill source code
                      sourceCodeEl.value = message.sourceCode;

                      // Fill language
                      const options = Array.from(languageEl.options);
                      let mappedLang = message.languageId;
                      if (!options.some((o: HTMLOptionElement) => o.value === message.languageId)) {
                        const lid = (message.languageId || "").toLowerCase();
                        if (lid.includes("cpp") || lid.includes("c++")) {
                          const opt =
                            options.find((o: HTMLOptionElement) => o.text.includes("C++20")) ||
                            options.find((o: HTMLOptionElement) => o.text.includes("C++17")) ||
                            options.find((o: HTMLOptionElement) => o.text.includes("G++"));
                          if (opt) mappedLang = opt.value;
                        } else if (lid.includes("py")) {
                          const opt =
                            options.find((o: HTMLOptionElement) => o.text.includes("PyPy 3")) ||
                            options.find((o: HTMLOptionElement) => o.text.includes("Python 3"));
                          if (opt) mappedLang = opt.value;
                        } else if (lid.includes("java")) {
                          const opt =
                            options.find((o: HTMLOptionElement) => o.text.includes("Java 21")) ||
                            options.find((o: HTMLOptionElement) => o.text.includes("Java 17")) ||
                            options.find((o: HTMLOptionElement) => o.text.includes("Java 11"));
                          if (opt) mappedLang = opt.value;
                        }
                      }
                      languageEl.value = mappedLang;

                      // Fill problem index if needed
                      if (message.problemIndex) {
                        const problemIndexEl = document.getElementsByName(
                          "submittedProblemIndex"
                        )[0] as HTMLSelectElement;
                        if (problemIndexEl) {
                          problemIndexEl.value = message.problemIndex;
                        }
                      }

                      // Click submit
                      console.log("[CPFlow injected] Clicking submit button");
                      const submitBtn = document.querySelector(
                        ".submit"
                      ) as HTMLButtonElement;
                      if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.click();
                      } else {
                        console.error("[CPFlow injected] Submit button not found!");
                      }
                    }
                  );
                },
              });

              // 4. Now send the data to the injected script (exactly like cph-submit)
              chrome.tabs.sendMessage(tabId, {
                type: "cpflow-do-submit",
                sourceCode,
                languageId,
                problemIndex,
              });

              console.log("[CPFlow tabSubmit] Message sent to tab");

              // 5. Listen for navigation to /my or /status to confirm submission
              const navFilter = {
                url: [
                  { urlContains: "codeforces.com/my" },
                  { urlContains: "codeforces.com/problemset/status" },
                  { urlContains: "codeforces.com/contest" },
                ],
              };

              // Give some time for submission, then try to scrape submission ID
              let scraped = false;
              const scrapeInterval = setInterval(async () => {
                try {
                  const results = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                      const url = window.location.href;
                      // Check if we navigated to status/my page
                      if (url.includes("/my") || url.includes("/status")) {
                        const row = document.querySelector(
                          "tr[data-submission-id]"
                        );
                        return {
                          navigated: true,
                          submissionId: row
                            ? row.getAttribute("data-submission-id")
                            : null,
                        };
                      }
                      // Check for error on submit page
                      if (url.includes("/submit")) {
                        const errorEl = document.querySelector("span.error");
                        if (errorEl && errorEl.textContent) {
                          return {
                            navigated: false,
                            error: errorEl.textContent,
                          };
                        }
                      }
                      return { navigated: false };
                    },
                  });

                  const res = results?.[0]?.result as any;
                  if (res?.navigated) {
                    scraped = true;
                    clearInterval(scrapeInterval);
                    chrome.tabs.remove(tabId);
                    sendResponse({
                      success: true,
                      data: { submissionId: res.submissionId },
                    });
                  } else if (res?.error) {
                    scraped = true;
                    clearInterval(scrapeInterval);
                    chrome.tabs.remove(tabId);
                    sendResponse({
                      success: false,
                      error: res.error,
                    });
                  }
                } catch (e) {
                  // Tab might have navigated, context invalidated — that's OK
                }
              }, 2000);

              // Timeout after 45 seconds
              setTimeout(() => {
                if (!scraped) {
                  clearInterval(scrapeInterval);
                  chrome.tabs.remove(tabId).catch(() => {});
                  sendResponse({
                    success: false,
                    error:
                      "Timed out waiting for Codeforces submission result.",
                  });
                }
              }, 45000);
            } catch (err: any) {
              console.error("[CPFlow tabSubmit] Script injection error:", err);
              sendResponse({
                success: false,
                error: "Failed to inject submit script: " + err.message,
              });
            }
          }, 1500); // Wait 1.5s after page load for CF JS to initialize
        }
      }
    );
  });
}
