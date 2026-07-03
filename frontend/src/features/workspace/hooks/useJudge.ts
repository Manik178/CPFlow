import { useState, useCallback, useEffect, useRef } from "react";
import { judgeService } from "../services/judge.service";
import { extensionService } from "../services/extension.service";
import type { TestCase, TestResult, ProblemData } from "@/shared/types/workspace";

export function useJudge() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pistonOnline, setPistonOnline] = useState<boolean | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    judgeService.checkHealth().then(setPistonOnline);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleRunCode = useCallback(
    async (code: string, language: string, testCases: TestCase[], onFinish?: () => void) => {
      setIsRunning(true);
      setResults([]);
      try {
        const activeCases = testCases.filter(tc => tc.enabled !== false);
        const data = await judgeService.runCode(code, language, activeCases);
        setResults(data);
      } catch (error) {
        console.error("Error executing code:", error);
        setResults([
          {
            testId: -1,
            stdout: null,
            stderr: "Execution failed to reach the server.",
            compile_output: null,
            time: null,
            memory: null,
            status: { id: 13, description: "Internal Error" },
            passed: false,
          },
        ]);
      } finally {
        setIsRunning(false);
        if (onFinish) onFinish();
      }
    },
    []
  );

  const [submissionVerdict, setSubmissionVerdict] = useState<any>(null);

  const handleSubmitCode = useCallback(
    async (code: string, language: string, problem: ProblemData | null) => {
      if (!problem) return;
      setIsSubmitting(true);
      setSubmissionVerdict({ status: "Submitting..." });
      
      try {
        // We don't await because tabSubmit might timeout or throw even though the submission succeeded on Codeforces
        extensionService.submitCode(code, language, problem.url).catch((err) => {
          console.warn("CPFlow: Submit command returned an error, but we will check for a submission anyway", err);
        });
        
        // Assume submission started, begin polling the LATEST submission
        setSubmissionVerdict({ status: "Submitted. Polling verdict..." });

        // Poll for verdict
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        
        pollIntervalRef.current = setInterval(async () => {
          try {
            const verdict = await extensionService.getVerdict("LATEST", problem.url);
            setSubmissionVerdict(verdict);
            
            if (verdict.status !== "Queued" && verdict.status !== "Running" && verdict.status !== "Unknown" && verdict.status !== "Submitted. Polling verdict...") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 3000);

      } catch (error: any) {
        setSubmissionVerdict({ status: "Error", compilerOutput: error.message });
        console.error("Submit error", error);
      } finally {
        // Wait a bit before enabling the submit button again to prevent spam
        setTimeout(() => setIsSubmitting(false), 3000);
      }
    },
    []
  );

  return {
    results,
    setResults,
    isRunning,
    isSubmitting,
    pistonOnline,
    submissionVerdict,
    handleRunCode,
    handleSubmitCode,
  };
}
