import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function TestCasePanel() {
  const { testCases, updateTestCase, removeTestCase, addTestCase } = useWorkspaceContext();
  const [activeTestCase, setActiveTestCase] = useState(0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="flex items-center gap-1 px-3 pt-3 pb-2 shrink-0 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {testCases.map((tc, idx) => (
          <button
            key={tc.id}
            onClick={() => setActiveTestCase(idx)}
            className={`group flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTestCase === idx
                ? "bg-zinc-800/80 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={tc.enabled !== false}
                onChange={(e) => updateTestCase(idx, "enabled", e.target.checked)}
                className="w-3 h-3 rounded accent-emerald-500 cursor-pointer"
              />
            </span>
            <span className={tc.enabled === false ? "opacity-40 line-through" : ""}>
              Case {idx + 1}
            </span>
            {testCases.length > 1 && (
              <Trash2
                className="w-3 h-3 text-red-400/60 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTestCase(idx);
                  if (activeTestCase === idx) {
                    setActiveTestCase(Math.max(0, idx - 1));
                  }
                }}
              />
            )}
          </button>
        ))}
        <button
          onClick={addTestCase}
          className="px-2 py-1 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
          title="Add Test Case"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-3">
          {testCases[activeTestCase] && (
            <>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Input</label>
                <textarea
                  className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 min-h-[60px] outline-none focus:border-zinc-600 transition-colors resize-none ${
                    testCases[activeTestCase].enabled === false ? "opacity-50" : ""
                  }`}
                  value={testCases[activeTestCase].input}
                  onChange={(e) => updateTestCase(activeTestCase, "input", e.target.value)}
                  placeholder="Enter input..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Expected Output</label>
                <textarea
                  className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 min-h-[60px] outline-none focus:border-zinc-600 transition-colors resize-none ${
                    testCases[activeTestCase].enabled === false ? "opacity-50" : ""
                  }`}
                  value={testCases[activeTestCase].expectedOutput}
                  onChange={(e) => updateTestCase(activeTestCase, "expectedOutput", e.target.value)}
                  placeholder="Expected output (optional)"
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
