"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2, Lightbulb, ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import { LearningHubLayout } from "@/features/learning-hub/components/LearningHubLayout";
import { ExplainPopover } from "@/features/learning-hub/components/ExplainPopover";
import { LearningHubData } from "@/features/learning-hub/types";
import { Button } from "@/components/ui/button";

function LearningHubContent() {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  
  const [data, setData] = useState<LearningHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, 'pending' | 'done'>>({
    overview: 'pending',
    editorial: 'pending',
    alternatives: 'pending',
    similar_problems: 'pending',
    resources: 'pending',
    validation: 'pending'
  });

  useEffect(() => {
    if (!pid) return;

    let isMounted = true;
    const fetchHub = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/problems/${pid}/learning-hub`);
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) throw new Error("No reader available");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const dataStr = part.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.error) {
                  throw new Error(parsed.error);
                } else if (parsed.status === "complete") {
                  if (isMounted) setData(parsed.final_data);
                } else if (parsed.node) {
                  if (isMounted) {
                    setProgress(prev => ({
                      ...prev,
                      [parsed.node]: 'done'
                    }));
                  }
                }
              } catch (e) {
                console.error("Failed to parse SSE JSON", e);
              }
            }
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load learning hub.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHub();

    return () => { isMounted = false; };
  }, [pid]);

  if (!pid) {
    return <div className="p-8 text-center text-zinc-400">No problem ID provided.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.close()} className="text-zinc-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h1 className="font-outfit font-semibold text-lg">Learning Hub</h1>
          </div>
        </div>
        <div className="text-sm font-medium text-yellow-400/80 bg-yellow-400/10 px-4 py-1.5 rounded-full">
          Tip: Always attempt the problem fully before using the learning hub
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {loading && !data && !error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Generating Educational Content</h2>
              <p className="text-zinc-400">Our multi-agent system is analyzing the problem.</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex flex-col gap-4">
                {Object.entries({
                  'overview': 'Generating Summary & Complexity',
                  'editorial': 'Writing Step-by-Step Editorial',
                  'alternatives': 'Exploring Alternative Approaches',
                  'similar_problems': 'Finding Similar Problems',
                  'resources': 'Curating External Resources',
                  'validation': 'Validating Content Accuracy'
                }).map(([key, label]) => {
                  const status = progress[key as keyof typeof progress];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      {status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <Circle className="w-5 h-5 text-zinc-700 absolute" />
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin absolute" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${status === 'done' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>Error: {error}</p>
          </div>
        ) : data ? (
          <>
            <LearningHubLayout data={data} pid={pid} />
            <ExplainPopover pid={pid} />
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function LearningHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <LearningHubContent />
    </Suspense>
  );
}
