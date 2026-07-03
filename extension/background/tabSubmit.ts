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

    // 2. Inject script directly (executeScript waits for document_idle automatically!)
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: (sourceCode: string, langId: string, probIndex: string) => {
        const languageEl = document.getElementsByName('programTypeId')[0] as HTMLSelectElement;
        const sourceCodeEl = document.getElementById('sourceCodeTextarea') as HTMLTextAreaElement;
        
        if (!languageEl || !sourceCodeEl) return { injected: false };

        sourceCodeEl.value = sourceCode;
        
        const options = Array.from(languageEl.options);
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
        languageEl.value = mappedLang;

        if (probIndex) {
          const problemIndexEl = document.getElementsByName('submittedProblemIndex')[0] as HTMLInputElement;
          if (problemIndexEl) {
            problemIndexEl.value = probIndex;
          }
        }

        const submitBtn = document.querySelector('.submit') as HTMLButtonElement;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.click();
          return { injected: true };
        }
        return { injected: false };
      },
      args: [code, languageId, problemIndex]
    });

    // 3. Wait for Navigation (Success or Validation Error)
    let navResolved = false;
    const checkNav = async () => {
      let checks = 0;
      while (!navResolved && checks < 40) { // Check for up to 40 seconds (Codeforces queue can be slow)
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
          
          const navRes = navResults[0]?.result as { done: boolean, type?: string, id?: string, msg?: string } | undefined;
          if (navRes && navRes.done) {
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
