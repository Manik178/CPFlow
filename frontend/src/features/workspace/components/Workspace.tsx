import React from "react";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { WorkspaceLayout } from "./layout/WorkspaceLayout";

export function Workspace() {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden font-sans">
      <WorkspaceNavbar />
      <WorkspaceLayout />
    </div>
  );
}
