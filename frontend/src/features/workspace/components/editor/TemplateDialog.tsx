import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bookmark, Save, Trash2 } from "lucide-react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { LANGUAGE_CONFIG } from "../../constants/language";

export function TemplateDialog() {
  const {
    language,
    savedTemplates,
    templateName,
    setTemplateName,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
  } = useWorkspaceContext();

  return (
    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
      <DialogTrigger
        render={
          <button
            title="Saved Templates"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          />
        }
      >
        <Bookmark className="w-3.5 h-3.5" />
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle>Saved Templates ({LANGUAGE_CONFIG[language].label})</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Name this template..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-sm h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTemplate();
              }}
            />
            <Button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              variant="secondary"
              className="gap-2 h-9"
            >
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>

          <Separator className="bg-zinc-800" />

          <ScrollArea className="h-[200px] rounded-md border border-zinc-800 p-2 bg-zinc-900/50">
            <div className="space-y-2">
              {savedTemplates.filter((t) => t.language === language).length === 0 ? (
                <div className="text-center text-sm text-zinc-500 py-8">
                  No saved templates for {LANGUAGE_CONFIG[language].label}.
                </div>
              ) : (
                savedTemplates
                  .filter((t) => t.language === language)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(t.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-zinc-700 hover:bg-zinc-800"
                          onClick={() => handleLoadTemplate(t)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => handleDeleteTemplate(t.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
