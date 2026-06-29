import React from "react";
import Editor from "@monaco-editor/react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { LANGUAGE_CONFIG } from "../../constants/language";

export function MonacoEditor() {
  const { language, code, setCode } = useWorkspaceContext();

  return (
    <div className="flex-1 bg-[#1e1e1e] overflow-hidden relative">
      <Editor
        height="100%"
        language={LANGUAGE_CONFIG[language].monacoId}
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
          tabSize: 4,
          wordWrap: "on",
          fixedOverflowWidgets: true,
        }}
      />
    </div>
  );
}
