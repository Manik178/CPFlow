import { useState, useEffect } from "react";
import { templateService } from "../services/template.service";
import type { Template } from "@/shared/types/workspace";

export function useTemplates() {
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  useEffect(() => {
    setSavedTemplates(templateService.getTemplates());
  }, []);

  const handleSaveTemplate = (code: string, language: string) => {
    if (!templateName.trim()) return;
    const newTemplate: Template = {
      id: Math.random().toString(36).substring(2, 9),
      name: templateName.trim(),
      code,
      language,
      timestamp: Date.now(),
    };
    const newTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(newTemplates);
    templateService.saveTemplates(newTemplates);
    setTemplateName("");
  };

  const handleDeleteTemplate = (id: string) => {
    const newTemplates = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(newTemplates);
    templateService.saveTemplates(newTemplates);
  };

  return {
    savedTemplates,
    templateName,
    setTemplateName,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    handleSaveTemplate,
    handleDeleteTemplate,
  };
}
