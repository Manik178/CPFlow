import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export function DrawerTabs() {
  const { activeTab, setActiveTab, isConsoleExpanded, setIsConsoleExpanded, results } =
    useWorkspaceContext();

  const handleToggleCollapse = () => {
    setIsConsoleExpanded(!isConsoleExpanded);
  };

  const handleTabClick = (e: React.MouseEvent, tab: string) => {
    e.stopPropagation();
    setActiveTab(tab);
    if (!isConsoleExpanded) {
      setIsConsoleExpanded(true);
    }
  };

  return (
    <div
      className="h-[42px] shrink-0 bg-transparent flex items-end justify-between px-4 border-b border-zinc-800 select-none"
      onClick={!isConsoleExpanded ? handleToggleCollapse : undefined}
      style={{ cursor: !isConsoleExpanded ? "pointer" : "default" }}
    >
      <div className="flex items-center gap-6 h-full pt-2">
        <button
          onClick={(e) => handleTabClick(e, "testcases")}
          className={`h-full flex items-center relative text-[13px] font-medium transition-colors pb-2 ${
            activeTab === "testcases"
              ? "text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Test Cases
          {activeTab === "testcases" && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={(e) => handleTabClick(e, "output")}
          className={`h-full flex items-center gap-1.5 relative text-[13px] font-medium transition-colors pb-2 ${
            activeTab === "output"
              ? "text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Output
          {results.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === "output" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-800/50 text-zinc-500"
            }`}>
              {results.filter((r) => r.passed).length}/{results.length}
            </span>
          )}
          {activeTab === "output" && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-500 rounded-t-full" />
          )}
        </button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCollapse();
        }}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800/50 mb-1.5"
      >
        {isConsoleExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
}
