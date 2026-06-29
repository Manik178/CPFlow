import React from "react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function ProblemHeader() {
  const { problem } = useWorkspaceContext();

  if (!problem) return null;

  return (
    <h2 className="text-2xl font-bold font-outfit mb-5">{problem.title}</h2>
  );
}
