import React from "react";
import { Clock, MemoryStick } from "lucide-react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function ProblemMetadata() {
  const { problem } = useWorkspaceContext();

  if (!problem) return null;

  return (
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
  );
}
