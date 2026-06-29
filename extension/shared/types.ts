export interface ProblemMetadata {
  platform: string;
  id: string; // e.g. '123A' or '1068'
  title: string;
  url: string;
}

export interface SubmissionDetails {
  submissionId: string;
  status: string;
  url: string;
  time?: string;
  memory?: string;
  language: string;
  problem: string;
}

export interface VerdictDetails {
  status: 
    | "Queued" 
    | "Compiling" 
    | "Running" 
    | "Accepted" 
    | "Wrong Answer" 
    | "Runtime Error" 
    | "Memory Limit" 
    | "Time Limit" 
    | "Compilation Error" 
    | "Internal Error"
    | "Presentation Error"
    | "Unknown";
  testcase?: number;
  time?: string;
  memory?: string;
  compilerOutput?: string;
}

export interface JudgeAdapter {
  checkLogin(): Promise<boolean>;
  getLanguages(): Promise<{ id: string; name: string }[]>;
  submit(code: string, languageId: string, problemUrl: string): Promise<{ success: boolean; submissionId?: string; error?: string }>;
  getLatestSubmission(problemUrl: string): Promise<SubmissionDetails | null>;
  getVerdict(submissionId: string, problemUrl: string): Promise<VerdictDetails>;
  syncSolved(): Promise<string[]>;
  detectProblem(): Promise<ProblemMetadata | null>;
}

export type ExtensionRequestType = 
  | "CHECK_LOGIN" 
  | "GET_LANGUAGES" 
  | "SUBMIT" 
  | "GET_VERDICT" 
  | "GET_LATEST_SUBMISSION" 
  | "SYNC_SOLVED" 
  | "DETECT_CURRENT_PROBLEM";

export interface ExtensionRequest {
  action: ExtensionRequestType;
  problemUrl?: string; // Used to route to the correct tab
  data?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}
