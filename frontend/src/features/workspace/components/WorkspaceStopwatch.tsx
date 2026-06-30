"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceStopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 shrink-0 select-none font-mono text-sm">
      <Timer className="w-3.5 h-3.5 text-zinc-400 mr-1" />
      <span className={`w-[48px] text-center ${isRunning ? "text-emerald-400 font-medium" : "text-zinc-300"}`}>
        {formatTime(time)}
      </span>
      
      <div className="flex items-center gap-0.5 ml-1 border-l border-zinc-800 pl-2">
        <button 
          onClick={toggleTimer}
          className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button 
          onClick={resetTimer}
          className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
