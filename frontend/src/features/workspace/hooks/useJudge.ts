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
        const res = await extensionService.submitCode(code, language, problem.url);
        if (!res.success || !res.submissionId) {
          throw new Error(res.error || "Submission failed");
        }
        
        setSubmissionVerdict({ status: "Submitted. Polling verdict..." });

        // Poll for verdict
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        
        pollIntervalRef.current = setInterval(async () => {
          try {
            const verdict = await extensionService.getVerdict(res.submissionId!, problem.url);
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
        alert("Failed to submit: " + error.message);
      } finally {
        setIsSubmitting(false);
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
