import React from "react";
import { RotateCcw, Wifi, WifiOff } from "lucide-react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { LANGUAGE_CONFIG } from "../../constants/language";
import { TemplateDialog } from "./TemplateDialog";

export function EditorHeader() {
  const { language, handleLanguageChange, handleResetCode, pistonOnline } = useWorkspaceContext();

  return (
    <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-zinc-900 text-xs font-medium text-zinc-300 rounded-t-md border border-b-0 border-zinc-800">
          {LANGUAGE_CONFIG[language].fileName}
        </div>
        <button
          onClick={handleResetCode}
          title="Reset to default template"
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <TemplateDialog />
      </div>

      <div className="flex items-center gap-3">
        {pistonOnline === false && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <WifiOff className="w-3 h-3" />
            Engine Offline
          </div>
        )}
        {pistonOnline === true && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            <Wifi className="w-3 h-3" />
            Ready
          </div>
        )}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {Object.entries(LANGUAGE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
