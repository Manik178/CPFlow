import { useState, useEffect } from "react";

const DRAWER_HEIGHT_KEY = "cpflow_drawer_height";
const DRAWER_EXPANDED_KEY = "cpflow_drawer_expanded";

export function useDrawer() {
  const [activeTab, setActiveTab] = useState("testcases");
  
  // Use 320px as default expanded height
  const [drawerHeight, setDrawerHeight] = useState(320);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHeight = localStorage.getItem(DRAWER_HEIGHT_KEY);
    const savedExpanded = localStorage.getItem(DRAWER_EXPANDED_KEY);
    
    if (savedHeight) {
      setDrawerHeight(Number(savedHeight));
    }
    if (savedExpanded !== null) {
      setIsConsoleExpanded(savedExpanded === "true");
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem(DRAWER_HEIGHT_KEY, drawerHeight.toString());
  }, [drawerHeight]);

  useEffect(() => {
    localStorage.setItem(DRAWER_EXPANDED_KEY, isConsoleExpanded.toString());
  }, [isConsoleExpanded]);

  return {
    activeTab,
    setActiveTab,
    isConsoleExpanded,
    setIsConsoleExpanded,
    drawerHeight,
    setDrawerHeight,
    isDragging,
    setIsDragging,
  };
}
