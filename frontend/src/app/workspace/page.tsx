"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Play, Send, Lightbulb, Clock, MemoryStick, CheckCircle, XCircle,
  Loader2, ChevronLeft, Plus, Trash2, RotateCcw, AlertTriangle, Wifi, WifiOff, Bookmark, Save
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const LANGUAGE_CONFIG: Record<string, { label: string; monacoId: string; fileName: string; template: string }> = {
  cpp: {
    label: "C++ (GCC 12)",
    monacoId: "cpp",
    fileName: "main.cpp",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    
    return 0;
}`,
  },
  python: {
    label: "Python 3",
    monacoId: "python",
    fileName: "main.py",
    template: `import sys
input = sys.stdin.readline

`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    fileName: "Main.java",
    template: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        
    }
}`,
  },
};

interface ProblemData {
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

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

interface TestResult {
  testId: number;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string } | null;
  passed: boolean;
}

interface Template {
  id: string;
  name: string;
  code: string;
  language: string;
  timestamp: number;
}

export default function WorkspacePage() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("pid");

  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);

  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG.cpp.template);

  const [testCases, setTestCases] = useState<TestCase[]>([{ id: 1, input: "", expectedOutput: "" }]);
  const [activeTestCase, setActiveTestCase] = useState(0);

  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("testcases");

  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Load problem from backend
  useEffect(() => {
    if (!problemId) return;
    setLoadingProblem(true);
    fetch(`${API_URL}/api/problems/${problemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: ProblemData) => {
        setProblem(data);
        // Pre-populate test cases from samples
        if (data.samples.length > 0) {
          setTestCases(
            data.samples.map((s, i) => ({
              id: i + 1,
              input: s.input,
              expectedOutput: s.output,
            }))
          );
        }
      })
      .catch(() => setProblem(null))
      .finally(() => setLoadingProblem(false));
  }, [problemId]);

  // Switch language → update template (only if code hasn't been modified from previous template)
  const handleLanguageChange = (newLang: string) => {
    const oldTemplate = LANGUAGE_CONFIG[language].template;
    if (code === oldTemplate || code === "") {
      setCode(LANGUAGE_CONFIG[newLang].template);
    }
    setLanguage(newLang);
  };

  // Run code against all test cases locally via Judge0 backend
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("output");
    setResults([]);

    const newResults: TestResult[] = [];

    for (const tc of testCases) {
      try {
        const res = await fetch(`${API_URL}/api/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: code,
            language,
            stdin: tc.input,
            expected_output: tc.expectedOutput || null,
          }),
        });

        if (!res.ok) throw new Error("Execution failed");
        const data = await res.json();

        const stdout = (data.stdout ?? "").trim();
        const passed = tc.expectedOutput
          ? stdout === tc.expectedOutput.trim()
          : true;

        newResults.push({
          testId: tc.id,
          stdout: data.stdout,
          stderr: data.stderr,
          compile_output: data.compile_output,
          time: data.time,
          memory: data.memory,
          status: data.status,
          passed,
        });
      } catch {
        newResults.push({
          testId: tc.id,
          stdout: null,
          stderr: "Network error or backend unavailable",
          compile_output: null,
          time: null,
          memory: null,
          status: null,
          passed: false,
        });
      }
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitCode = () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    
    // Set up a listener for the response
    const handleResponse = (event: MessageEvent) => {
      if (event.source !== window || !event.data) return;
      if (event.data.type === "CPFLOW_SUBMIT_RESPONSE") {
        setIsSubmitting(false);
        window.removeEventListener("message", handleResponse);
        
        const response = event.data.response;
        if (response && response.success) {
          alert("Successfully submitted to " + problem.platform + "! Check your original tab.");
        } else {
          alert("Failed to submit: " + (response?.error || "Unknown error"));
        }
      }
    };
    
    window.addEventListener("message", handleResponse);
    
    // Send the message to the extension bridge
    window.postMessage({
      type: "CPFLOW_SUBMIT",
      data: {
        problemUrl: problem.url,
        code: code,
        language: language
      }
    }, "*");
    
    // Timeout after 10 seconds if extension doesn't reply
    setTimeout(() => {
      window.removeEventListener("message", handleResponse);
      if (isSubmitting) {
        setIsSubmitting(false);
        alert("Submission timed out. Make sure the browser extension is installed and the problem tab is still open.");
      }
    }, 10000);
  };

  // Test case management
  const addTestCase = () => {
    const newId = testCases.length > 0 ? Math.max(...testCases.map((t) => t.id)) + 1 : 1;
    setTestCases([...testCases, { id: newId, input: "", expectedOutput: "" }]);
    setActiveTestCase(testCases.length);
  };

  const removeTestCase = (idx: number) => {
    const updated = testCases.filter((_, i) => i !== idx);
    setTestCases(updated);
    if (activeTestCase >= updated.length) setActiveTestCase(Math.max(0, updated.length - 1));
  };

  const updateTestCase = (idx: number, field: "input" | "expectedOutput", value: string) => {
    setTestCases(testCases.map((tc, i) => (i === idx ? { ...tc, [field]: value } : tc)));
  };

  const platformColors: Record<string, string> = {
    Codeforces: "text-blue-400",
    CSES: "text-emerald-400",
  };

  // Piston health check
  const [pistonOnline, setPistonOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const checkPiston = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health/piston`);
        const data = await res.json();
        setPistonOnline(data.status === "online");
      } catch {
        setPistonOnline(false);
      }
    };
    checkPiston();
    const interval = setInterval(checkPiston, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cpflow_templates");
    if (stored) {
      try {
        setSavedTemplates(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModKey = e.metaKey || e.ctrlKey;
      if (isModKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (problem && !isSubmitting) handleSubmitCode();
      } else if (isModKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) handleRunCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code, language, testCases, isRunning, isSubmitting, problem]);

  const handleResetCode = () => {
    setCode(LANGUAGE_CONFIG[language].template);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate: Template = {
      id: Math.random().toString(36).substring(2, 9),
      name: templateName.trim(),
      code,
      language,
      timestamp: Date.now(),
    };
    const newTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(newTemplates);
    localStorage.setItem("cpflow_templates", JSON.stringify(newTemplates));
    setTemplateName("");
  };

  const handleLoadTemplate = (t: Template) => {
    setCode(t.code);
    setIsTemplateDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const newTemplates = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(newTemplates);
    localStorage.setItem("cpflow_templates", JSON.stringify(newTemplates));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden font-sans">
      {/* Navbar */}
      <header className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </a>
          <h1 className="font-outfit font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            CPFlow
          </h1>
          {problem && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className={`text-xs font-semibold ${platformColors[problem.platform] ?? "text-zinc-400"}`}>
                {problem.platform}
              </span>
              <span className="text-sm font-medium text-zinc-300 truncate max-w-md">
                {problem.title}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Learning Hub
          </Button>
          <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Pane: Problem Statement */}
        <ResizablePanel defaultSize={40} minSize={25} className="bg-zinc-950/30">
          <ScrollArea className="h-full">
            <div className="p-6">
              {loadingProblem ? (
                <div className="flex items-center gap-2 text-muted-foreground mt-20 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading problem...
                </div>
              ) : problem ? (
                <>
                  {/* Tags & Limits */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                    {problem.difficulty && (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold">
                        {problem.difficulty}
                      </span>
                    )}
                    <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                      {problem.time_limit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {problem.time_limit}s
                        </span>
                      )}
                      {problem.memory_limit && (
                        <span className="flex items-center gap-1">
                          <MemoryStick className="w-3.5 h-3.5" /> {problem.memory_limit}MB
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold font-outfit mb-5">{problem.title}</h2>

                  {/* Rendered statement HTML */}
                  <div
                    className="prose prose-invert prose-sm max-w-none text-zinc-300 [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:text-emerald-400"
                    dangerouslySetInnerHTML={{ __html: problem.statement_html }}
                  />

                  {/* Sample Tests */}
                  {problem.samples.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold font-outfit">Sample Tests</h3>
                      {problem.samples.map((sample, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4">
                          <Card className="p-3 bg-zinc-950 border-zinc-800">
                            <div className="text-xs text-zinc-500 mb-1.5 font-semibold uppercase tracking-wider">Input</div>
                            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{sample.input}</pre>
                          </Card>
                          <Card className="p-3 bg-zinc-950 border-zinc-800">
                            <div className="text-xs text-zinc-500 mb-1.5 font-semibold uppercase tracking-wider">Output</div>
                            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{sample.output}</pre>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center mt-20 gap-4">
                  <div className="text-5xl">📝</div>
                  <h3 className="text-xl font-outfit font-semibold">No problem loaded</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Use the CPFlow browser extension on Codeforces or CSES to scrape a problem and open it here.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Pane: Editor & Output */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={65}>
              <div className="h-full flex flex-col">
                <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-zinc-900 text-xs font-medium text-zinc-300 rounded-t-md border border-b-0 border-zinc-800">
                      {LANGUAGE_CONFIG[language].fileName}
                    </div>
                    <button
                      onClick={handleResetCode}
                      title="Reset to default template"
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                      <DialogTrigger 
                        render={
                          <button
                            title="Saved Templates"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                          />
                        }
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                        <DialogHeader>
                          <DialogTitle>Saved Templates ({LANGUAGE_CONFIG[language].label})</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 pt-4">
                          {/* Save current */}
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Name this template..." 
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="bg-zinc-900 border-zinc-800 text-sm h-9"
                              onKeyDown={(e) => { if(e.key === 'Enter') handleSaveTemplate(); }}
                            />
                            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()} variant="secondary" className="gap-2 h-9">
                              <Save className="w-4 h-4" /> Save
                            </Button>
                          </div>

                          <Separator className="bg-zinc-800" />

                          {/* List saved templates for current language */}
                          <ScrollArea className="h-[200px] rounded-md border border-zinc-800 p-2 bg-zinc-900/50">
                            <div className="space-y-2">
                              {savedTemplates.filter(t => t.language === language).length === 0 ? (
                                <div className="text-center text-sm text-zinc-500 py-8">
                                  No saved templates for {LANGUAGE_CONFIG[language].label}.
                                </div>
                              ) : (
                                savedTemplates.filter(t => t.language === language).map(t => (
                                  <div key={t.id} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                                      <span className="text-[10px] text-zinc-500">{new Date(t.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 hover:bg-zinc-800" onClick={() => handleLoadTemplate(t)}>
                                        Load
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDeleteTemplate(t.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center gap-3">
                    {pistonOnline === false && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <WifiOff className="w-3 h-3" />
                        Engine Offline
                      </div>
                    )}
                    {pistonOnline === true && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <Wifi className="w-3 h-3" />
                        Ready
                      </div>
                    )}
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      {Object.entries(LANGUAGE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1 bg-[#1e1e1e]">
                  <Editor
                    height="100%"
                    language={LANGUAGE_CONFIG[language].monacoId}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      tabSize: 4,
                      wordWrap: "on",
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output / Tests */}
            <ResizablePanel defaultSize={35}>
              <div className="h-full flex flex-col bg-zinc-950">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/60">
                    <TabsList className="h-8 bg-transparent p-0 gap-4">
                      <TabsTrigger value="testcases" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-1 text-xs">
                        Test Cases
                      </TabsTrigger>
                      <TabsTrigger value="output" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-1 text-xs">
                        Output
                        {results.length > 0 && (
                          <span className="ml-1.5 text-[10px] text-zinc-500">
                            ({results.filter((r) => r.passed).length}/{results.length})
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSubmitCode}
                          disabled={isSubmitting || !problem}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium h-7 text-xs"
                        >
                          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Submit
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRunCode}
                          disabled={isRunning}
                          className="h-7 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          {isRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          {isRunning ? "Running..." : "Run"}
                          <span className="text-[10px] opacity-50 ml-0.5 hidden sm:inline">⌘↵</span>
                        </Button>
                    </div>
                  </div>

                  {/* Test Cases Tab */}
                  <TabsContent value="testcases" className="flex-1 p-0 m-0 overflow-hidden">
                    <div className="flex h-full">
                      {/* Test case tabs sidebar */}
                      <div className="w-28 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
                        <ScrollArea className="flex-1">
                          <div className="p-2 space-y-1">
                            {testCases.map((tc, idx) => (
                              <button
                                key={tc.id}
                                onClick={() => setActiveTestCase(idx)}
                                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between group ${
                                  activeTestCase === idx
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                              >
                                Case {idx + 1}
                                {testCases.length > 1 && (
                                  <Trash2
                                    className="w-3 h-3 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400"
                                    onClick={(e) => { e.stopPropagation(); removeTestCase(idx); }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                        <button
                          onClick={addTestCase}
                          className="flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 py-2 border-t border-zinc-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>

                      {/* Active test case editor */}
                      <div className="flex-1 p-4 space-y-3">
                        {testCases[activeTestCase] && (
                          <>
                            <div>
                              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Input</label>
                              <textarea
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 min-h-[70px] outline-none focus:border-blue-500/60 transition-colors resize-none"
                                value={testCases[activeTestCase].input}
                                onChange={(e) => updateTestCase(activeTestCase, "input", e.target.value)}
                                placeholder="Enter input..."
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Expected Output</label>
                              <textarea
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 min-h-[70px] outline-none focus:border-blue-500/60 transition-colors resize-none"
                                value={testCases[activeTestCase].expectedOutput}
                                onChange={(e) => updateTestCase(activeTestCase, "expectedOutput", e.target.value)}
                                placeholder="Expected output (optional)"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Output Tab */}
                  <TabsContent value="output" className="flex-1 p-0 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        {results.length === 0 && !isRunning && (
                          <div className="text-zinc-600 text-sm flex h-full items-center justify-center italic mt-8">
                            Run your code to see output here.
                          </div>
                        )}
                        {isRunning && (
                          <div className="flex items-center gap-2 text-zinc-400 text-sm mt-8 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" /> Executing...
                          </div>
                        )}
                        {results.map((r, idx) => (
                          <Card key={idx} className="p-4 bg-zinc-900/60 border-zinc-800">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {r.passed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium">Test Case {r.testId}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-zinc-500">
                                {r.time && <span>{r.time}s</span>}
                                {r.memory && <span>{(r.memory / 1024).toFixed(1)} MB</span>}
                                {r.status && (
                                  <span className={`font-medium ${r.status.id === 3 ? "text-emerald-400" : "text-red-400"}`}>
                                    {r.status.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            {r.compile_output && (
                              <div className="mb-2">
                                <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-1">Compile Error</div>
                                <pre className="font-mono text-xs text-red-300 bg-red-950/30 rounded p-2 whitespace-pre-wrap">{r.compile_output}</pre>
                              </div>
                            )}
                            {r.stderr && (
                              <div className="mb-2">
                                <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-1">Stderr</div>
                                <pre className="font-mono text-xs text-orange-300 bg-orange-950/30 rounded p-2 whitespace-pre-wrap">{r.stderr}</pre>
                              </div>
                            )}
                            <div>
                              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Output</div>
                              <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{r.stdout ?? "(no output)"}</pre>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
