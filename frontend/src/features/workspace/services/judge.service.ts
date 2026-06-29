import { API_URL } from "../constants/api";
import type { TestCase, TestResult } from "@/shared/types/workspace";

export const judgeService = {
  async runCode(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<TestResult[]> {
    const promises = testCases.map(async (tc) => {
      const res = await fetch(`${API_URL}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language: language,
          stdin: tc.input,
          expected_output: tc.expectedOutput,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Execution failed");
      }

      const data = await res.json();
      return {
        testId: tc.id,
        stdout: data.stdout,
        stderr: data.stderr,
        compile_output: data.compile_output,
        time: data.time,
        memory: data.memory,
        status: data.status,
        passed: data.passed,
      };
    });

    return await Promise.all(promises);
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/health/piston`);
      const data = await res.json();
      return data.status === "online";
    } catch (error) {
      return false;
    }
  }
};
