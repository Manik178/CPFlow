import type { Template } from "@/shared/types/workspace";

const STORAGE_KEY = "cpflow_templates";

export const templateService = {
  getTemplates(userId: string = "anonymous"): Template[] {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }
    return [];
  },

  saveTemplates(templates: Template[], userId: string = "anonymous"): void {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(templates));
  }
};
