import React from "react";
import { ChevronLeft, Play, Send, Loader2, Lightbulb, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession, signIn, signOut } from "next-auth/react";
import { useWorkspaceContext } from "../context/WorkspaceContext";

const platformColors: Record<string, string> = {
  Codeforces: "text-blue-400",
  CSES: "text-emerald-400",
};

export function WorkspaceNavbar() {
  const { data: session } = useSession();
  const { problem, isRunning, handleRunCode, isSubmitting, handleSubmitCode, submissionVerdict, syncState } =
    useWorkspaceContext();

  return (
    <header className="h-14 border-b border-zinc-800/60 grid grid-cols-3 items-center px-6 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex items-center gap-4 justify-start overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-zinc-400 hover:text-white px-2 -ml-2 shrink-0"
          onClick={() => window.location.href = '/dashboard'}
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Button>
        <h1 className="font-outfit font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 shrink-0">
          CPFlow
        </h1>
        {problem && (
          <>
            <Separator orientation="vertical" className="h-6 shrink-0" />
            <span
              className={`text-xs font-semibold shrink-0 ${
                platformColors[problem.platform] ?? "text-zinc-400"
              }`}
            >
              {problem.platform}
            </span>
            <span className="text-sm font-medium text-zinc-300 truncate max-w-[200px]">
              {problem.title}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          size="sm"
          onClick={handleRunCode}
          disabled={isRunning}
          className="h-8 gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 px-4"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          Run
        </Button>
        {submissionVerdict && (
          <span className={`text-xs font-medium px-2 ${submissionVerdict.status === 'Accepted' ? 'text-emerald-400' : submissionVerdict.status.includes('Error') || submissionVerdict.status === 'Wrong Answer' || submissionVerdict.status === 'Time Limit' || submissionVerdict.status === 'Memory Limit' ? 'text-red-400' : 'text-zinc-400'}`}>
            {submissionVerdict.status} {submissionVerdict.testcase ? `(Test ${submissionVerdict.testcase})` : ''}
          </span>
        )}
        <Button
          size="sm"
          onClick={handleSubmitCode}
          disabled={isSubmitting || !problem}
          className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Submit
        </Button>
      </div>

      <div className="flex items-center gap-3 justify-end">
        {session?.user && problem && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 shrink-0">
            {syncState === 'Saving...' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : syncState === 'Offline' || syncState === 'Sync Failed' ? (
              <div className="w-2 h-2 rounded-full bg-red-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-[11px] font-medium text-zinc-400">
              {syncState}
            </span>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => window.open(`/workspace/learning-hub?pid=${problem?.problem_id || ''}`, '_blank')}
          disabled={!problem}
        >
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Learning Hub
        </Button>

        {session?.user ? (
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <span className="text-sm font-medium pl-2">
              {session.user.name?.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => signIn()} className="gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
