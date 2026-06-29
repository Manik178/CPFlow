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
      const csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      if (!csrfInput || !csrfInput.value) {
        return { success: false, error: "CSRF token not found. Are you logged in?" };
      }

      const match = window.location.pathname.match(/task\/(\d+)/);
      if (!match) {
        return { success: false, error: "Could not parse task ID from URL." };
      }
      const taskId = match[1];

      const formData = new FormData();
      formData.append("csrf_token", csrfInput.value);
      formData.append("task", taskId);
      formData.append("lang", languageId);
      
      const blob = new Blob([code], { type: "text/plain" });
      const ext = languageId === "Python3" ? "py" : languageId === "Java" ? "java" : "cpp";
      formData.append("file", blob, `solution.${ext}`);

      // We intercept the redirect to get the submission ID!
      const res = await fetch(`/problemset/submit/${taskId}/`, {
        method: "POST",
        body: formData,
        redirect: "manual" // We prevent redirect to inspect Location header or we let it follow and check URL.
      });

      // Since fetch inside browser context follows redirects automatically and returns the final URL,
      // we check `res.url` which will be `/problemset/result/{submissionId}/` if successful!
      if (res.url && res.url.includes('/result/')) {
        const subIdMatch = res.url.match(/result\/(\d+)/);
        if (subIdMatch) {
          return { success: true, submissionId: subIdMatch[1] };
        }
      }

      return { success: false, error: "CSES submission failed or did not return a submission ID." };
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

      // Check for compile error
      const h2s = Array.from(doc.querySelectorAll('h2'));
      const compileErrH2 = h2s.find(h2 => h2.textContent?.includes("Compile error"));
      if (compileErrH2) {
        const pre = compileErrH2.nextElementSibling as HTMLPreElement;
        return {
          status: "Compilation Error",
          compilerOutput: pre?.textContent || ""
        };
      }

      // Check general status from the info block
      const resultBlock = doc.querySelector('.summary-block'); 
      const resultText = resultBlock?.textContent?.trim() || "";

      let status: VerdictDetails["status"] = "Unknown";
      if (resultText.includes("PENDING")) status = "Queued";
      else if (resultText.includes("READY")) {
         // check tests
         const failedTest = doc.querySelector('tr.task-score-zero');
         if (!failedTest) {
           status = "Accepted";
         } else {
           const verdictTd = failedTest.querySelector('td:nth-child(2)');
           const v = verdictTd?.textContent?.trim() || "";
           if (v.includes("Wrong answer")) status = "Wrong Answer";
           else if (v.includes("Time limit")) status = "Time Limit";
           else if (v.includes("Runtime error")) status = "Runtime Error";
           
           const testMatch = failedTest.querySelector('td:first-child')?.textContent?.match(/#(\d+)/);
           return {
             status,
             testcase: testMatch ? parseInt(testMatch[1]) : undefined,
           };
         }
      }

      return { status };
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
