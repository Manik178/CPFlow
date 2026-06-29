import type { JudgeAdapter, ProblemMetadata, SubmissionDetails, VerdictDetails } from "../shared/types";

export class CsesAdapter implements JudgeAdapter {

  async checkLogin(): Promise<boolean> {
    const logoutLink = document.querySelector('a[href="/logout"]');
    return !!logoutLink;
  }

  async getLanguages(): Promise<{ id: string; name: string }[]> {
    // CSES doesn't use a <select> for language, but we map standard languages.
    // CSES expects "C++", "Python3", "Java", etc. in the FormData
    return [
      { id: "C++", name: "C++" },
      { id: "Java", name: "Java" },
      { id: "Python3", name: "Python3" },
      { id: "Rust", name: "Rust" },
      { id: "Haskell", name: "Haskell" }
    ];
  }

  async submit(code: string, languageId: string, problemUrl: string): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      const match = window.location.pathname.match(/task\/(\d+)/);
      if (!match) {
        return { success: false, error: "Could not parse task ID from URL." };
      }
      const taskId = match[1];

      // Fetch the submit page directly to ensure we get the form even if it's not on the current task page
      const submitPageRes = await fetch(`/problemset/submit/${taskId}/`);
      const submitPageText = await submitPageRes.text();
      const doc = new DOMParser().parseFromString(submitPageText, "text/html");
      const form = doc.querySelector('form');
      if (!form) {
        return { success: false, error: "Submission form not found on the submit page. Are you logged in?" };
      }

      // Extract all existing hidden tokens (including CSRF) directly from the fetched form
      const formData = new FormData(form);
      
      // Map CPFlow language ID to CSES select values
      const csesLangMapping: Record<string, string> = {
          "C++": "C++",
          "Java": "Java",
          "Python3": "Python3",
          "Rust": "Rust",
          "Haskell": "Haskell",
      };
      
      const langSelect = form.querySelector('select[name="lang"]') as HTMLSelectElement;
      if (langSelect) {
         formData.set(langSelect.name, csesLangMapping[languageId] || "C++");
      } else {
         formData.set("lang", csesLangMapping[languageId] || "C++");
      }
      
      const blob = new Blob([code], { type: "text/plain" });
      const ext = languageId === "Python3" ? "py" : languageId === "Java" ? "java" : "cpp";
      
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputName = fileInput ? fileInput.name : "file";
      formData.set(fileInputName, blob, `solution.${ext}`);

      // We intercept the redirect to get the submission ID!
      const targetUrl = form.action || `/problemset/submit/${taskId}/`;
      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData
      });

      // Since fetch inside browser context follows redirects automatically and returns the final URL,
      // we check `res.url` which will be `/problemset/result/{submissionId}/` if successful!
      if (res.url && res.url.includes('/result/')) {
        const subIdMatch = res.url.match(/result\/(\d+)/);
        if (subIdMatch) {
          return { success: true, submissionId: subIdMatch[1] };
        }
      }

      // If we reach here, it means submission failed. Let's parse the error from CSES.
      const errorText = await res.text();
      const errorDoc = new DOMParser().parseFromString(errorText, "text/html");
      
      // Try multiple selectors that CSES might use for errors
      let errorMsg = "CSES submission failed.";
      const errorAlert = errorDoc.querySelector('.alert.error') || errorDoc.querySelector('.alert');
      if (errorAlert && errorAlert.textContent) {
        errorMsg += " " + errorAlert.textContent.trim();
      }

      return { success: false, error: errorMsg };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async getLatestSubmission(problemUrl: string): Promise<SubmissionDetails | null> {
    const match = problemUrl.match(/task\/(\d+)/);
    if (!match) return null;
    
    try {
      // Navigate to /problemset/user/ to get recent submissions
      const res = await fetch('/problemset/user/');
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      
      // Find the row for this specific task
      const link = doc.querySelector(`a[href^="/problemset/task/${match[1]}"]`);
      if (!link) return null;

      const row = link.closest("tr");
      if (!row) return null;

      const resultLink = row.querySelector('a[href^="/problemset/result/"]') as HTMLAnchorElement;
      if (!resultLink) return null;

      const subIdMatch = resultLink.href.match(/result\/(\d+)/);
      if (!subIdMatch) return null;

      return {
        submissionId: subIdMatch[1],
        status: resultLink.className || "Unknown",
        url: resultLink.href,
        language: row.querySelector('td:nth-child(4)')?.textContent?.trim() || "",
        problem: problemUrl
      };
    } catch (e) {
      return null;
    }
  }

  async getVerdict(submissionId: string, problemUrl: string): Promise<VerdictDetails> {
    try {
      const res = await fetch(`https://cses.fi/problemset/result/${submissionId}/`);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");

      const table = doc.querySelector('table');
      if (!table) return { status: "Unknown" };

      // 1. Check for compile error
      const h2s = Array.from(doc.querySelectorAll('h2'));
      const compileErrH2 = h2s.find(h2 => h2.textContent?.includes("Compile error"));
      if (compileErrH2) {
        const pre = compileErrH2.nextElementSibling as HTMLPreElement;
        return {
          status: "Compilation Error",
          compilerOutput: pre?.textContent || ""
        };
      }

      // 2. Parse the submission details table
      const contentDiv = doc.querySelector('.content') || doc.querySelector('.skeleton') || doc.body;
      let statusText = "";
      let resultText = "";
      
      const tables = Array.from(contentDiv.querySelectorAll('table'));
      
      // Usually the first table is the Submission details
      const detailsRows = tables.length > 0 ? Array.from(tables[0].querySelectorAll('tr')) : [];
      for (const row of detailsRows) {
        const cells = Array.from(row.querySelectorAll('th, td'));
        if (cells.length >= 2) {
          const key = cells[0].textContent?.trim().replace(":", "");
          if (key === "Status") {
            statusText = cells[1].textContent?.trim().toUpperCase() || "";
          } else if (key === "Result") {
            resultText = cells[1].textContent?.trim().toUpperCase() || "";
          }
        }
      }

      // 3. Find the first failed test case from the Test results table (usually the second table)
      let failedTestCase: number | undefined = undefined;
      const testRows = Array.from(contentDiv.querySelectorAll('table tr'));
      for (const row of testRows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
           const testNumMatch = cells[0].textContent?.match(/#(\d+)/);
           const verdict = cells[1].textContent?.trim().toUpperCase() || "";
           if (testNumMatch && (verdict.includes("WRONG ANSWER") || verdict.includes("TIME LIMIT") || verdict.includes("RUNTIME ERROR"))) {
               failedTestCase = parseInt(testNumMatch[1]);
               break;
           }
        }
      }

      // 4. Map the parsed text to CPFlow VerdictDetails
      // If Result is available, that is the final verdict
      if (resultText) {
          if (resultText.includes("COMPILE ERROR")) return { status: "Compilation Error" };
          if (resultText.includes("ACCEPTED")) return { status: "Accepted" };
          
          let status: VerdictDetails["status"] = "Unknown";
          if (resultText.includes("WRONG ANSWER")) status = "Wrong Answer";
          else if (resultText.includes("TIME LIMIT")) status = "Time Limit";
          else if (resultText.includes("RUNTIME ERROR")) status = "Runtime Error";
          
          if (status !== "Unknown") {
              return { status, testcase: failedTestCase };
          }
      }

      // If Result is missing, check Status for pending states
      if (statusText) {
          if (statusText.includes("PENDING") || statusText.includes("TESTING") || statusText.includes("EVALUATING") || statusText.includes("WAITING")) {
              return { status: "Queued" };
          }
      }

      // 5. Ultimate fallback (could be a parse failure)
      const debugText = contentDiv.textContent?.replace(/\s+/g, ' ').substring(0, 100) || "EMPTY";
      return { status: (`DEBUG: ${debugText}` as any) };
    } catch (e) {
      return { status: "Unknown" };
    }
  }

  async syncSolved(): Promise<string[]> {
    try {
      const res = await fetch("https://cses.fi/problemset/user/");
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      
      const solved = new Set<string>();
      // Find all fully solved tasks (typically marked with green text or checkmark)
      const rows = doc.querySelectorAll('table.table tr');
      for (const row of Array.from(rows)) {
        const score = row.querySelector('td:nth-child(5)')?.textContent?.trim();
        if (score === "100") {
           const taskLink = row.querySelector('a[href^="/problemset/task/"]') as HTMLAnchorElement;
           const match = taskLink?.href.match(/task\/(\d+)/);
           if (match) solved.add(match[1]);
        }
      }
      return Array.from(solved);
    } catch (e) {
      return [];
    }
  }

  async detectProblem(): Promise<ProblemMetadata | null> {
    const titleEl = document.querySelector('.title-block h1');
    if (!titleEl) return null;

    const url = window.location.href;
    const match = url.match(/task\/(\d+)/);
    
    if (!match) return null;

    return {
      platform: "CSES",
      id: match[1],
      title: titleEl.textContent?.trim() || "",
      url: url.split("?")[0]
    };
  }
}
