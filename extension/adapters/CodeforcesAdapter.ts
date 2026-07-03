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
    // This is now dead code! Codeforces submissions are intercepted by the background script 
    // and handled via tab automation in tabSubmit.ts to bypass anti-bot protections.
    return { success: false, error: "Submission should be handled by background tab automation." };
  }

  async getLatestSubmission(problemUrl: string): Promise<SubmissionDetails | null> {
    try {
      const urlObj = new URL(problemUrl);
      const origin = urlObj.origin;
      const path = urlObj.pathname;
      
      let mySubmissionsUrl = "";
      const gymMatch = path.match(/^\/gym\/(\d+)/);
      const contestMatch = path.match(/^\/contest\/(\d+)/);
      
      if (gymMatch) {
         mySubmissionsUrl = `${origin}/gym/${gymMatch[1]}/my`;
      } else if (contestMatch) {
         mySubmissionsUrl = `${origin}/contest/${contestMatch[1]}/my`;
      } else {
         mySubmissionsUrl = `${origin}/problemset/status?my=on`;
      }

      const res = await fetch(mySubmissionsUrl);
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
        
        let row: Element | null = null;
        if (submissionId === "LATEST") {
          row = doc.querySelector(`tr[data-submission-id]`);
        } else {
          row = doc.querySelector(`tr[data-submission-id="${submissionId}"]`);
        }
        
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
