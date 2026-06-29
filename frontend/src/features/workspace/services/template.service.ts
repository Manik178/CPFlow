import type { Template } from "@/shared/types/workspace";

const STORAGE_KEY = "cpflow_templates";

export const templateService = {
  getTemplates(): Template[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }
    return [];
  },

  saveTemplates(templates: Template[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }
};
