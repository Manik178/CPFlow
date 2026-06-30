import type { JudgeAdapter, ProblemMetadata, SubmissionDetails, VerdictDetails } from "../shared/types";

export class CodeforcesAdapter implements JudgeAdapter {
  
  async checkLogin(): Promise<boolean> {
    // Check if the "Enter" or "Register" link is absent, meaning we are logged in.
    const enterLink = document.querySelector('a[href*="/enter"]');
    return !enterLink;
  }

  async getLanguages(): Promise<{ id: string; name: string }[]> {
    const select = document.querySelector('select[name="programTypeId"]') as HTMLSelectElement;
    if (!select) return [];
    
    return Array.from(select.options).map(opt => ({
      id: opt.value,
      name: opt.text
    }));
  }

  async submit(code: string, languageId: string, problemUrl: string): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      // 1. Determine the correct submit URL and whether we need to provide a problem index
      const url = new URL(problemUrl);
      const path = url.pathname;
      const origin = url.origin;
      
      let submitUrl = "";
      let problemIndex = "";

      const contestMatch = path.match(/^\/contest\/(\d+)(?:\/problem\/([^\/]+))?/);
      const gymMatch = path.match(/^\/gym\/(\d+)(?:\/problem\/([^\/]+))?/);
      const gymProblemsetMatch = path.match(/^\/problemset\/gymProblem\/(\d+)\/([^\/]+)/);
      const problemsetMatch = path.match(/^\/problemset\/problem\/(\d+)\/([^\/]+)/);

      if (gymProblemsetMatch) {
        submitUrl = `${origin}/gym/${gymProblemsetMatch[1]}/submit`;
        problemIndex = gymProblemsetMatch[2];
      } else if (gymMatch) {
        submitUrl = `${origin}/gym/${gymMatch[1]}/submit`;
        problemIndex = gymMatch[2] || "";
      } else if (contestMatch) {
        submitUrl = `${origin}/contest/${contestMatch[1]}/submit`;
        problemIndex = contestMatch[2] || "";
      } else if (problemsetMatch) {
        submitUrl = `${origin}/problemset/submit/${problemsetMatch[1]}/${problemsetMatch[2]}`;
      } else {
        submitUrl = `${origin}/problemset/submit`; // Fallback
      }

      // 2. Fetch the submit page to extract CSRF token and hidden form fields
      const res = await fetch(submitUrl);
      const text = await res.text();
      const doc1 = new DOMParser().parseFromString(text, "text/html");
      const form = doc1.querySelector('form.submit-form') as HTMLFormElement | null 
                   || doc1.querySelector('form[action*="submit"]') as HTMLFormElement | null;
      
      if (!form) {
        return { success: false, error: "Submit form not found on the submit page. Are you logged in?" };
      }

      // 3. Map CPFlow language to Codeforces programTypeId
      let mappedLanguageId = languageId;
      const select = form.querySelector('select[name="programTypeId"]') as HTMLSelectElement | null;
      if (select) {
        const options = Array.from(select.options);
        // If the given languageId isn't exactly one of the values (like "89"), map it
        if (!options.some(o => o.value === languageId)) {
          if (languageId.toLowerCase().includes("cpp") || languageId.toLowerCase().includes("c++")) {
             const cppOpt = options.find(o => o.text.includes("C++20")) || 
                            options.find(o => o.text.includes("C++17")) || 
                            options.find(o => o.text.includes("G++"));
             if (cppOpt) mappedLanguageId = cppOpt.value;
          } else if (languageId.toLowerCase().includes("python") || languageId.toLowerCase().includes("py")) {
             const pyOpt = options.find(o => o.text.includes("PyPy 3")) || 
                           options.find(o => o.text.includes("Python 3"));
             if (pyOpt) mappedLanguageId = pyOpt.value;
          } else if (languageId.toLowerCase().includes("java")) {
             const javaOpt = options.find(o => o.text.includes("Java 21")) || 
                             options.find(o => o.text.includes("Java 17")) || 
                             options.find(o => o.text.includes("Java 11"));
             if (javaOpt) mappedLanguageId = javaOpt.value;
          }
        }
      }

      // 4. Construct the payload from the hidden inputs
      const formData = new URLSearchParams();
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((el) => {
        const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (input.name && input.name !== "sourceFile") {
          formData.append(input.name, input.value);
        }
      });

      // Overwrite the code and language
      formData.set("source", code);
      formData.set("programTypeId", mappedLanguageId);
      if (problemIndex && formData.has("submittedProblemIndex")) {
        formData.set("submittedProblemIndex", problemIndex);
      }

      // 4. Submit the code
      const submitActionUrl = form.getAttribute("action") ? new URL(form.getAttribute("action")!, submitUrl).href : submitUrl;
      const submitRes = await fetch(submitActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const responseText = await submitRes.text();
      
      if (submitRes.url.includes("/status") || submitRes.url.includes("/my")) {
        const doc2 = new DOMParser().parseFromString(responseText, "text/html");
        const row = doc2.querySelector('tr[data-submission-id]');
        const submissionId = row?.getAttribute('data-submission-id') || undefined;
        return { success: true, submissionId };
      }
      
      // If we didn't get redirected to a status page, there's likely a validation error.
      const doc3 = new DOMParser().parseFromString(responseText, "text/html");
      const errorSpans = doc3.querySelectorAll('span.error');
      for (let i = 0; i < errorSpans.length; i++) {
        const text = errorSpans[i].textContent?.trim();
        if (text) {
          return { success: false, error: text };
        }
      }

      // Fallback if no redirect but success (rare)
      const rowFallback = doc3.querySelector('tr[data-submission-id]');
      if (rowFallback) {
         return { success: true, submissionId: rowFallback.getAttribute('data-submission-id') || undefined };
      }

      return { success: false, error: "Codeforces rejected the submission but provided no error message. Please check the Codeforces page manually." };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async getLatestSubmission(problemUrl: string): Promise<SubmissionDetails | null> {
    // Navigate to /my to get user submissions, or just parse the "Last submissions" sidebar if on problem page
    const mySubmissionsLink = document.querySelector('a[href$="/my"]') as HTMLAnchorElement;
    if (!mySubmissionsLink) return null;

    try {
      const res = await fetch(mySubmissionsLink.href);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      
      const row = doc.querySelector('table.status-frame-datatable tr[data-submission-id]');
      if (!row) return null;

      const submissionId = row.getAttribute('data-submission-id') || "";
      const statusCell = row.querySelector('td.status-verdict-cell');
      const statusText = statusCell?.textContent?.trim() || "Unknown";
      
      const timeCell = row.querySelector('td.time-consumed-cell');
      const memoryCell = row.querySelector('td.memory-consumed-cell');
      const langCell = row.querySelector('td:nth-child(5)');

      return {
        submissionId,
        status: statusText,
        url: `https://codeforces.com/contest/${row.getAttribute('data-contestId')}/submission/${submissionId}`,
        time: timeCell?.textContent?.trim(),
        memory: memoryCell?.textContent?.trim(),
        language: langCell?.textContent?.trim() || "",
        problem: problemUrl,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getVerdict(submissionId: string, problemUrl: string): Promise<VerdictDetails> {
    let data: any = {};
    try {
      const csrfToken = document.querySelector('meta[name="X-Csrf-Token"]')?.getAttribute('content') || "";
      const res = await fetch("https://codeforces.com/data/submitSource", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `submissionId=${submissionId}&csrf_token=${csrfToken}`
      });
      data = await res.json();
    } catch (e) {
      console.warn("Failed to fetch submitSource data", e);
    }
    
    try {
      
      // Codeforces /data/submitSource returns compiler output and source, but not always the live verdict if it's running.
      // Alternatively, we fetch the status page.
      // Construct the status page URL manually instead of relying on the DOM
      let mySubmissionsUrl = "";
      const urlObj = new URL(problemUrl);
      const origin = urlObj.origin;
      const path = urlObj.pathname;
      
      const gymMatch = path.match(/^\/gym\/(\d+)/);
      const contestMatch = path.match(/^\/contest\/(\d+)/);
      
      if (gymMatch) {
         mySubmissionsUrl = `${origin}/gym/${gymMatch[1]}/my`;
      } else if (contestMatch) {
         mySubmissionsUrl = `${origin}/contest/${contestMatch[1]}/my`;
      } else {
         mySubmissionsUrl = `${origin}/problemset/status?my=on`;
      }

      if (mySubmissionsUrl) {
        // Append a timestamp to bypass browser cache
        const cacheBusterUrl = mySubmissionsUrl + (mySubmissionsUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
        const statusRes = await fetch(cacheBusterUrl, { cache: 'no-store' });
        const statusText = await statusRes.text();
        const doc = new DOMParser().parseFromString(statusText, "text/html");
        const row = doc.querySelector(`tr[data-submission-id="${submissionId}"]`);
        
        if (row) {
          const verdictCell = row.querySelector('td.status-verdict-cell');
          const rawStatus = (verdictCell?.textContent?.trim() || "").toLowerCase();
          
          let parsedStatus: VerdictDetails["status"] = "Unknown";
          let testcase: number | undefined;

          // Check for exact Codeforces attribute if available
          const verdictSpan = verdictCell?.querySelector('[submissionverdict]');
          const svAttr = verdictSpan?.getAttribute('submissionverdict');

          if (svAttr === "OK") parsedStatus = "Accepted";
          else if (svAttr === "WRONG_ANSWER") parsedStatus = "Wrong Answer";
          else if (svAttr === "TIME_LIMIT_EXCEEDED") parsedStatus = "Time Limit";
          else if (svAttr === "MEMORY_LIMIT_EXCEEDED") parsedStatus = "Memory Limit";
          else if (svAttr === "RUNTIME_ERROR") parsedStatus = "Runtime Error";
          else if (svAttr === "COMPILATION_ERROR") parsedStatus = "Compilation Error";

          if (parsedStatus === "Unknown") {
            if (rawStatus.includes("running") || rawStatus.includes("in queue") || rawStatus.includes("testing")) {
              parsedStatus = rawStatus.includes("running") || rawStatus.includes("testing") ? "Running" : "Queued";
            } else if (rawStatus.includes("accepted") || rawStatus.includes("pretests passed") || rawStatus.includes("happy new year")) {
              parsedStatus = "Accepted";
            } else if (rawStatus.includes("wrong answer")) {
              parsedStatus = "Wrong Answer";
            } else if (rawStatus.includes("compilation error")) {
              parsedStatus = "Compilation Error";
            } else if (rawStatus.includes("time limit exceeded")) {
              parsedStatus = "Time Limit";
            } else if (rawStatus.includes("runtime error")) {
              parsedStatus = "Runtime Error";
            } else if (rawStatus.includes("memory limit exceeded")) {
              parsedStatus = "Memory Limit";
            }
          }

          const match = rawStatus.match(/on test (\d+)/);
          if (match) testcase = parseInt(match[1]);

          let compilerOutput = undefined;
          if (parsedStatus === "Compilation Error") {
             compilerOutput = data.checkerStdoutAndStderr || "Compiler output unavailable.";
          }

          return {
            status: parsedStatus,
            testcase,
            time: row.querySelector('td.time-consumed-cell')?.textContent?.trim(),
            memory: row.querySelector('td.memory-consumed-cell')?.textContent?.trim(),
            compilerOutput
          };
        }
      }
      return { status: "Unknown" };
    } catch (e) {
      return { status: "Unknown" };
    }
  }

  async syncSolved(): Promise<string[]> {
    const handle = document.querySelector('.lang-chooser a[href^="/profile/"]')?.textContent?.trim();
    if (!handle) return [];

    try {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
      const data = await res.json();
      if (data.status !== "OK") return [];

      const solved = new Set<string>();
      for (const sub of data.result) {
        if (sub.verdict === "OK") {
          solved.add(`${sub.problem.contestId}${sub.problem.index}`);
        }
      }
      return Array.from(solved);
    } catch (e) {
      return [];
    }
  }

  async detectProblem(): Promise<ProblemMetadata | null> {
    const titleEl = document.querySelector('.problem-statement .title');
    if (!titleEl) return null;

    const url = window.location.href;
    const match = url.match(/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Za-z0-9]+)/);
    
    if (!match) return null;

    return {
      platform: "Codeforces",
      id: `${match[1]}${match[2]}`,
      title: titleEl.textContent?.trim() || "",
      url: url.split("?")[0]
    };
  }
}
