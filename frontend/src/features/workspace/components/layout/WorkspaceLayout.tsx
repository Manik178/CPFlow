import React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ProblemPanel } from "../problem/ProblemPanel";
import { EditorPanel } from "../editor/EditorPanel";
import { BottomDrawer } from "../drawer/BottomDrawer";

export function WorkspaceLayout() {
  return (
    <div className="flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Pane: Problem Statement */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <ProblemPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Pane: Editor Column */}
        <ResizablePanel defaultSize={60}>
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden min-h-0">
              <EditorPanel />
            </div>
            <BottomDrawer />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
