"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ExternalLink, Code2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Recommendation {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  justification: string;
}

export function RecommendationsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/recommendations");
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleOpenProblem = (rec: Recommendation) => {
    const url = `https://codeforces.com/problemset/problem/${rec.contestId}/${rec.index}`;
    // We could open it via the extension or just redirect to the problem and let the extension scrape it.
    // Or we could trigger the import API directly if we wanted, but the simplest is opening the CF page.
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="rounded-full gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors" />}>
        <Sparkles className="w-4 h-4" />
        Suggested Questions
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-outfit">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            AI Recommended Practice
          </DialogTitle>
          <DialogDescription>
            Curated problems specifically selected to target your weak topics and push your rating to the next level.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-zinc-400">Analyzing your profile and generating recommendations...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-10 text-red-400">
              Failed to generate recommendations. Please try again later.
            </div>
          )}

          {data?.recommendations?.map((rec: Recommendation, i: number) => (
            <Card key={rec.id} className="bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-medium text-zinc-100">{rec.name}</h3>
                    <div className="text-xs px-2 py-0.5 rounded-full font-medium text-blue-400 border border-blue-400/30 bg-blue-400/10">
                      *{rec.rating}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {rec.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {tag}
                      </span>
                    ))}
                    {rec.tags.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        +{rec.tags.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-300 italic border-l-2 border-emerald-500/50 pl-3">
                    "{rec.justification}"
                  </p>
                </div>
                
                <Button 
                  onClick={() => handleOpenProblem(rec)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Problem
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {data?.recommendations?.length === 0 && (
            <div className="text-center py-10 text-zinc-400">
              No recommendations could be generated at this time. Solve some more problems first!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
