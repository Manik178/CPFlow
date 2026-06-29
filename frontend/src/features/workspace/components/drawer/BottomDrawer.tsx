import React, { useRef, useEffect } from "react";
import { DrawerTabs } from "./DrawerTabs";
import { TestCasePanel } from "./TestCasePanel";
import { OutputPanel } from "./OutputPanel";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

const MIN_HEIGHT = 42; // Header size

export function BottomDrawer() {
  const {
    isConsoleExpanded,
    setIsConsoleExpanded,
    drawerHeight,
    setDrawerHeight,
    isDragging,
    setIsDragging,
    activeTab,
  } = useWorkspaceContext();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();

      // Find the parent container (the right pane) height
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const parentBottom = parentRect.bottom;
      const parentHeight = parentRect.height;
      const maxHeight = parentHeight * 0.6; // Max 60% of editor column

      // Calculate new height relative to the parent's bottom
      const newHeight = parentBottom - e.clientY;

      // Snap to collapsed if dragged too low
      if (newHeight < 80) {
        setIsConsoleExpanded(false);
        return;
      }

      setIsConsoleExpanded(true);
      setDrawerHeight(Math.max(MIN_HEIGHT, Math.min(newHeight, maxHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, setDrawerHeight, setIsConsoleExpanded]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDoubleClick = () => {
    setIsConsoleExpanded(!isConsoleExpanded);
  };

  const currentHeight = isConsoleExpanded ? Math.max(MIN_HEIGHT, drawerHeight) : MIN_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-zinc-950 shrink-0 relative ${
        !isDragging ? "transition-[height] duration-150 ease-out" : ""
      }`}
      style={{ height: `${currentHeight}px` }}
    >
      {/* Drag Handle Container (5px hit area) */}
      <div
        className="absolute top-[-2.5px] left-0 w-full h-[5px] cursor-ns-resize z-50 group flex items-center justify-center"
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
      >
        {/* Visible 2px divider with accent color on hover */}
        <div className="w-full h-[2px] bg-zinc-800 transition-colors delay-100 duration-200 group-hover:bg-emerald-500/50" />
      </div>

      <DrawerTabs />

      {isConsoleExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "testcases" && <TestCasePanel />}
          {activeTab === "output" && <OutputPanel />}
        </div>
      )}
    </div>
  );
}
