import React from "react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function ProblemStatement() {
  const { problem } = useWorkspaceContext();

  if (!problem) return null;

  return (
    <div
      className="prose prose-invert prose-sm max-w-none text-zinc-300 [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:text-emerald-400 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-zinc-100 [&_h3]:mt-6 [&_h3]:mb-2"
      dangerouslySetInnerHTML={{ __html: problem.statement_html }}
    />
  );
}
