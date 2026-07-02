import { API_URL } from "../constants/api";
import type { TestCase, TestResult } from "@/shared/types/workspace";

export const judgeService = {
  async runCode(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<TestResult[]> {
    const promises = testCases.map(async (tc) => {
      // 1. Submit the job
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
        throw new Error("Execution failed to queue");
      }

      const { job_id } = await res.json();
      
      // 2. Poll the status
      while (true) {
        // Wait 1 second before polling
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const statusRes = await fetch(`${API_URL}/api/run/status/${job_id}`);
        if (!statusRes.ok) {
          throw new Error("Failed to fetch execution status");
        }
        
        const statusData = await statusRes.json();
        
        if (statusData.status === "completed") {
          const data = statusData.result;
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
        }
      }
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
