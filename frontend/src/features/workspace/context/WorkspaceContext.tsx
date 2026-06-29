import React, { createContext, useContext, useState, useCallback } from "react";
import { useProblem } from "../hooks/useProblem";
import { useJudge } from "../hooks/useJudge";
import { useTemplates } from "../hooks/useTemplates";
import { useDrawer } from "../hooks/useDrawer";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { LANGUAGE_CONFIG } from "../constants/language";
import type { ProblemData, TestCase, TestResult, Template } from "@/shared/types/workspace";

interface WorkspaceContextValue {
  // Problem State
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
  // 1. Editor State (Local to context since it ties logic together)
  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG.cpp.template);

  // 2. Compose Hooks
  const problemHook = useProblem(problemId);
  const drawerHook = useDrawer();
  const judgeHook = useJudge();
  const templatesHook = useTemplates();

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
