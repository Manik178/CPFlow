import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function OutputPanel() {
  const { results, isRunning } = useWorkspaceContext();

  return (
    <div className="flex-1 overflow-hidden">
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
                    <span
                      className={`font-medium ${
                        r.status.id === 3 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {r.status.description}
                    </span>
                  )}
                </div>
              </div>
              {r.compile_output && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-1">
                    Compile Error
                  </div>
                  <pre className="font-mono text-xs text-red-300 bg-red-950/30 rounded p-2 whitespace-pre-wrap">
                    {r.compile_output}
                  </pre>
                </div>
              )}
              {r.stderr && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-1">
                    Stderr
                  </div>
                  <pre className="font-mono text-xs text-orange-300 bg-orange-950/30 rounded p-2 whitespace-pre-wrap">
                    {r.stderr}
                  </pre>
                </div>
              )}
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Output
                </div>
                <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                  {r.stdout ?? "(no output)"}
                </pre>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
