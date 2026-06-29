import React from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { ProblemMetadata } from "./ProblemMetadata";
import { ProblemHeader } from "./ProblemHeader";
import { ProblemStatement } from "./ProblemStatement";
import { SampleTests } from "./SampleTests";

export function ProblemPanel() {
  const { problem, loadingProblem } = useWorkspaceContext();

  return (
    <ScrollArea className="h-full bg-zinc-950/30">
      <div className="p-6">
        {loadingProblem ? (
          <div className="flex items-center gap-2 text-muted-foreground mt-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading problem...
          </div>
        ) : problem ? (
          <>
            <ProblemMetadata />
            <ProblemHeader />
            <ProblemStatement />
            <SampleTests />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center mt-20 gap-4">
            <div className="text-5xl">📝</div>
            <h3 className="text-xl font-outfit font-semibold">No problem loaded</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use the CPFlow browser extension on Codeforces or CSES to scrape a problem and open it here.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
