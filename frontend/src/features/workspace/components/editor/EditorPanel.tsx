import React from "react";
import { EditorHeader } from "./EditorHeader";
import { MonacoEditor } from "./MonacoEditor";

export function EditorPanel() {
  return (
    <div className="h-full flex flex-col">
      <EditorHeader />
      <MonacoEditor />
    </div>
  );
}
