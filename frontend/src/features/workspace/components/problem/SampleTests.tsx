import React from "react";
import { Card } from "@/components/ui/card";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function SampleTests() {
  const { problem } = useWorkspaceContext();

  if (!problem || problem.samples.length === 0) return null;

  return (
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
  );
}
