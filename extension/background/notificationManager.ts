import type { VerdictDetails } from "../shared/types";

export const NotificationManager = {
  notifySuccess(message: string) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon512.png"),
      title: "CPFlow Submission",
      message,
      priority: 0,
    });
  },

  notifyVerdict(verdict: VerdictDetails) {
    let title = "Verdict Update";
    let message: string = verdict.status;
    let priority = 1;

    if (verdict.status === "Accepted") {
      title = "Accepted! 🎉";
      message = "Your solution passed all tests.";
    } else if (verdict.status === "Wrong Answer") {
      title = "Wrong Answer";
      message = verdict.testcase ? `Failed on test ${verdict.testcase}` : "Failed on some test case.";
    } else if (verdict.status === "Time Limit") {
      title = "Time Limit Exceeded";
      message = verdict.testcase ? `TLE on test ${verdict.testcase}` : "Execution took too long.";
    } else if (verdict.status === "Runtime Error") {
      title = "Runtime Error";
      message = verdict.testcase ? `Crashed on test ${verdict.testcase}` : "The program crashed.";
    } else if (verdict.status === "Compilation Error") {
      title = "Compilation Error";
      message = "Click to view compiler output in CPFlow.";
    } else if (verdict.status === "Memory Limit") {
      title = "Memory Limit Exceeded";
      message = verdict.testcase ? `MLE on test ${verdict.testcase}` : "Program used too much memory.";
    } else {
      // Don't notify for "Queued", "Running", "Unknown" unless desired.
      return;
    }

    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon512.png"),
      title,
      message,
      priority,
    });
  },

  notifyError(errorMsg: string) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon512.png"),
      title: "Submission Error",
      message: errorMsg,
      priority: 2,
    });
  }
};

// Handle clicking on a notification to focus CPFlow tab
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.query({ url: "*://localhost:3000/*" }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id!, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    }
  });
});
