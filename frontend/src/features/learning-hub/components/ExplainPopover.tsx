"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';

interface ExplainPopoverProps {
  pid: string;
}

export function ExplainPopover({ pid }: ExplainPopoverProps) {
  const [selection, setSelection] = useState<string>("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // If clicking inside the popover, do nothing
      if (popoverRef.current?.contains(e.target as Node)) {
        return;
      }

      const sel = window.getSelection();
      const text = sel?.toString().trim();

      if (text && text.length > 10) {
        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection(text);
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setExplanation(null);
      } else {
        setSelection("");
        setPosition(null);
        setExplanation(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleExplain = async () => {
    if (!selection) return;
    
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await fetch(`/api/problems/${pid}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlighted_text: selection })
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setExplanation(data.markdown_content);
    } catch (err: any) {
      setExplanation("Failed to explain: " + err.message);
    } finally {
      setIsExplaining(false);
    }
  };

  if (!position) return null;

  return (
    <div 
      ref={popoverRef}
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full pb-4"
      style={{ left: position.x, top: position.y }}
    >
      <div className="bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl overflow-hidden min-w-[300px] max-w-[400px]">
        {!explanation && !isExplaining && (
          <div className="p-2">
            <Button 
              size="sm" 
              onClick={handleExplain}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Explain Simply
            </Button>
          </div>
        )}

        {isExplaining && (
          <div className="p-6 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-sm">Simplifying concept...</p>
          </div>
        )}

        {explanation && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950/50">
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Explanation
              </div>
              <button 
                onClick={() => { setPosition(null); setSelection(""); setExplanation(null); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
