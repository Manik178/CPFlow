import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onSave: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export function useKeyboardShortcuts({ onSave, onRun, isRunning }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModKey = e.metaKey || e.ctrlKey;
      if (isModKey && e.key === "s") {
        e.preventDefault();
        onSave();
      } else if (isModKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) onRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onRun, isRunning]);
}
