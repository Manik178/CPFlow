import { useState, useEffect } from "react";
import { problemService } from "../services/problem.service";
import type { ProblemData, TestCase } from "@/shared/types/workspace";

export function useProblem(problemId: string | null) {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, input: "", expectedOutput: "", enabled: true },
  ]);

  useEffect(() => {
    if (!problemId) return;

    setLoadingProblem(true);
    problemService.fetchProblem(problemId)
      .then((data) => {
        setProblem(data);
        if (data.samples && data.samples.length > 0) {
          setTestCases(
            data.samples.map((s, idx) => ({
              id: idx + 1,
              input: s.input,
              expectedOutput: s.output,
              enabled: true,
            }))
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching problem:", error);
      })
      .finally(() => {
        setLoadingProblem(false);
      });
  }, [problemId]);

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { id: prev.length + 1, input: "", expectedOutput: "", enabled: true },
    ]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    problem,
    loadingProblem,
    testCases,
    setTestCases,
    updateTestCase,
    addTestCase,
    removeTestCase,
  };
}
