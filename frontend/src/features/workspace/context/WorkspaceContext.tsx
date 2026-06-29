import React, { createContext, useContext, useState, useCallback } from "react";
import { useProblem } from "../hooks/useProblem";
import { useJudge } from "../hooks/useJudge";
import { useTemplates } from "../hooks/useTemplates";
import { useDrawer } from "../hooks/useDrawer";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { LANGUAGE_CONFIG } from "../constants/language";
import { useWorkspaceRecovery } from "../hooks/useWorkspaceRecovery";
import { useAutosave } from "../hooks/useAutosave";
import { useWorkspaceSync, type SyncState } from "../hooks/useWorkspaceSync";
import type { ProblemData, TestCase, TestResult, Template } from "@/shared/types/workspace";
import { useSession } from "next-auth/react";

interface WorkspaceContextValue {
  // Problem State
  isRestoring: boolean;
  syncState: SyncState;
  problem: ProblemData | null;
  loadingProblem: boolean;
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  updateTestCase: (index: number, field: keyof TestCase, value: any) => void;
  addTestCase: () => void;
  removeTestCase: (index: number) => void;

  // Editor State
  language: string;
  setLanguage: (lang: string) => void;
  code: string;
  setCode: (code: string) => void;
  handleLanguageChange: (newLang: string) => void;
  handleResetCode: () => void;

  // Judge State
  results: TestResult[];
  setResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
  isRunning: boolean;
  isSubmitting: boolean;
  pistonOnline: boolean | null;
  submissionVerdict: any;
  handleRunCode: () => void;
  handleSubmitCode: () => void;

  // Drawer State
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isConsoleExpanded: boolean;
  setIsConsoleExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  drawerHeight: number;
  setDrawerHeight: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;

  // Templates State
  savedTemplates: Template[];
  templateName: string;
  setTemplateName: React.Dispatch<React.SetStateAction<string>>;
  isTemplateDialogOpen: boolean;
  setIsTemplateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveTemplate: () => void;
  handleLoadTemplate: (t: Template) => void;
  handleDeleteTemplate: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  problemId,
}: {
  children: React.ReactNode;
  problemId: string | null;
}) {
  // 1. Editor State
  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>("");

  const { data: session } = useSession();

  // 2. Compose Hooks
  const problemHook = useProblem(problemId);
  const drawerHook = useDrawer();
  const judgeHook = useJudge();
  const templatesHook = useTemplates(session?.user?.id);

  const { isRestoring } = useWorkspaceRecovery({
    platform: problemHook.problem?.platform,
    problemId: problemHook.problem?.problem_id,
    defaultLanguage: "cpp",
    setLanguage,
    setCode,
    setDrawerHeight: drawerHook.setDrawerHeight,
    setActiveTab: drawerHook.setActiveTab,
    setTestCases: problemHook.setTestCases,
    userId: session?.user?.id,
  });

  useAutosave({
    platform: problemHook.problem?.platform,
    problemId: problemHook.problem?.problem_id,
    title: problemHook.problem?.title,
    language,
    code,
    drawerHeight: drawerHook.drawerHeight,
    activeTab: drawerHook.activeTab,
    testCases: problemHook.testCases,
    isRestoring,
  });

  const { syncState } = useWorkspaceSync(session?.user?.id);

  // 3. Bind Actions
  const handleRunCode = useCallback(() => {
    judgeHook.handleRunCode(code, language, problemHook.testCases, () =>
      drawerHook.setActiveTab("output")
    );
  }, [code, language, problemHook.testCases, judgeHook, drawerHook]);

  const handleSubmitCode = useCallback(() => {
    judgeHook.handleSubmitCode(code, language, problemHook.problem);
  }, [code, language, problemHook.problem, judgeHook]);

  const handleLanguageChange = (newLang: string) => {
    if (code === LANGUAGE_CONFIG[language].template) {
      setCode(LANGUAGE_CONFIG[newLang].template);
    }
    setLanguage(newLang);
  };

  const handleResetCode = () => {
    setCode(LANGUAGE_CONFIG[language].template);
  };

  const handleSaveTemplate = () => templatesHook.handleSaveTemplate(code, language);
  const handleLoadTemplate = (t: Template) => {
    setCode(t.code);
    templatesHook.setIsTemplateDialogOpen(false);
  };

  useKeyboardShortcuts({
    onSave: handleSubmitCode,
    onRun: handleRunCode,
    isRunning: judgeHook.isRunning,
  });

  const value: WorkspaceContextValue = {
    isRestoring,
    syncState,
    ...problemHook,
    ...drawerHook,
    ...judgeHook,
    ...templatesHook,
    language,
    setLanguage,
    code,
    setCode,
    handleLanguageChange,
    handleResetCode,
    handleRunCode,
    handleSubmitCode,
    handleSaveTemplate,
    handleLoadTemplate,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return ctx;
}
