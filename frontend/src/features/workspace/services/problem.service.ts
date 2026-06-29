import { API_URL } from "../constants/api";
import type { ProblemData } from "@/shared/types/workspace";

export const problemService = {
  async fetchProblem(problemId: string): Promise<ProblemData> {
    const res = await fetch(`${API_URL}/api/problems/${problemId}`);
    if (!res.ok) {
      throw new Error("Problem not found");
    }
    return res.json();
  }
};
