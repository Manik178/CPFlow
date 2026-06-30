"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { WorkspaceProvider } from "@/features/workspace/context/WorkspaceContext";
import { Workspace } from "@/features/workspace/components/Workspace";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("pid");

  return (
    <WorkspaceProvider problemId={problemId}>
      <Workspace />
    </WorkspaceProvider>
  );
}

export default function WorkspacePage() {
  return (
    <React.Suspense fallback={null}>
      <WorkspaceContent />
    </React.Suspense>
  );
}
