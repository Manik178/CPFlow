"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Send, Lightbulb, Clock, CheckCircle } from "lucide-react";

export default function WorkspacePage() {
  const [code, setCode] = useState<string>('#include <iostream>\n\nint main() {\n    std::cout << "Hello CPFlow!" << std::endl;\n    return 0;\n}');
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    // Mock run
    setTimeout(() => {
      setOutput("Hello CPFlow!");
      setIsRunning(false);
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden font-sans">
      {/* Navbar */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <h1 className="font-outfit font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            CPFlow
          </h1>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-medium text-muted-foreground">Codeforces 1920A - Satisfying Constraints</span>
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
        <ResizablePanel defaultSize={40} minSize={25} className="bg-muted/10">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">Math</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold">1200</span>
                <div className="flex items-center text-xs text-muted-foreground gap-1 ml-auto">
                  <Clock className="w-3.5 h-3.5" /> 2.0 s
                </div>
              </div>
              <h2 className="text-2xl font-bold font-outfit mb-4">Satisfying Constraints</h2>
              
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <p>Alex is solving a problem. He has a single variable $x$ and $n$ constraints on it.</p>
                <p>Each constraint is of one of three types:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code>1 k</code> — $x$ must be greater than or equal to $k$</li>
                  <li><code>2 k</code> — $x$ must be less than or equal to $k$</li>
                  <li><code>3 k</code> — $x$ must not be equal to $k$</li>
                </ul>
                <p>Find the number of integers $x$ that satisfy all $n$ constraints.</p>
                
                <h3 className="text-lg font-semibold text-white mt-6 mb-2">Input</h3>
                <p>The first line contains a single integer $t$ — the number of test cases.</p>
                
                <h3 className="text-lg font-semibold text-white mt-6 mb-2">Output</h3>
                <p>For each test case, output a single integer — the number of valid $x$.</p>
              </div>

              {/* Sample Test Cases */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold font-outfit">Sample Tests</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-3 bg-zinc-950 border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Input</div>
                    <pre className="font-mono text-sm text-zinc-300">4\n1 3\n2 10\n3 5\n3 8</pre>
                  </Card>
                  <Card className="p-3 bg-zinc-950 border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Output</div>
                    <pre className="font-mono text-sm text-zinc-300">6</pre>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Pane: Editor & Output */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col">
                <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between">
                  <div className="flex gap-1">
                    <div className="px-3 py-1 bg-zinc-900 text-xs font-medium text-zinc-300 rounded-t-md border border-b-0 border-zinc-800">main.cpp</div>
                  </div>
                  <div className="flex gap-2">
                    <select className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 outline-none">
                      <option>C++ (GCC 12)</option>
                      <option>Python 3</option>
                      <option>Java</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 bg-[#1e1e1e]">
                  <Editor
                    height="100%"
                    language="cpp"
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
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output / Tests */}
            <ResizablePanel defaultSize={30}>
              <div className="h-full flex flex-col bg-zinc-950">
                <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
                  <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                    <TabsList className="h-8 bg-transparent p-0 gap-4">
                      <TabsTrigger value="testcases" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-1">Test Cases</TabsTrigger>
                      <TabsTrigger value="output" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-1">Output</TabsTrigger>
                    </TabsList>
                    <Button size="sm" variant="secondary" onClick={handleRunCode} disabled={isRunning} className="h-7 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="w-3.5 h-3.5" />
                      {isRunning ? "Running..." : "Run"}
                    </Button>
                  </div>
                  
                  <TabsContent value="testcases" className="flex-1 p-0 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                       <div className="p-4 space-y-4">
                          <Card className="p-3 bg-zinc-900 border-zinc-800">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-300">Test Case 1</span>
                             </div>
                             <textarea 
                               className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm font-mono text-zinc-300 min-h-[80px] outline-none focus:border-blue-500 transition-colors"
                               defaultValue={"4\n1 3\n2 10\n3 5\n3 8"}
                             />
                          </Card>
                       </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="output" className="flex-1 p-0 m-0 overflow-hidden bg-[#0d0d0d]">
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        {output ? (
                          <div className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{output}</div>
                        ) : (
                          <div className="text-zinc-600 text-sm flex h-full items-center justify-center italic mt-10">
                            Run your code to see output here.
                          </div>
                        )}
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
