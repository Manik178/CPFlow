export interface ProblemData {
  problem_id: string;
  title: string;
  url: string;
  platform: string;
  statement_html: string;
  time_limit: number | null;
  memory_limit: number | null;
  tags: string[];
  difficulty: string | null;
  samples: { input: string; output: string }[];
}

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  enabled?: boolean;
}

export interface TestResult {
  testId: number;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string } | null;
  passed: boolean;
}

export interface Template {
  id: string;
  name: string;
  code: string;
  language: string;
  timestamp: number;
}
