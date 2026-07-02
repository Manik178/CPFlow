export function resolveCodeforcesSubmitTarget(problemUrl: string): { submitUrl: string; problemIndex: string } {
  try {
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
      problemIndex = gymProblemsetMatch[2] || "";
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

    return { submitUrl, problemIndex };
  } catch (e) {
    return { submitUrl: "https://codeforces.com/problemset/submit", problemIndex: "" };
  }
}
