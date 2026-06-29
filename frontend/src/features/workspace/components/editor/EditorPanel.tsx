import React from "react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { EditorHeader } from "./EditorHeader";
import { MonacoEditor } from "./MonacoEditor";
import { Skeleton } from "@/components/ui/skeleton";

export function EditorPanel() {
  const { isRestoring } = useWorkspaceContext();

  return (
    <div className="h-full flex flex-col">
      <EditorHeader />
      {isRestoring ? (
        <div className="flex-1 p-4 bg-zinc-950">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      ) : (
        <MonacoEditor />
      )}
    </div>
  );
}
