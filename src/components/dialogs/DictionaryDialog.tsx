import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/lib/studio";
import { toast } from "sonner";

export function DictionaryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { dictionary, addEntry, deleteEntry } = useStudio();
  const [term, setTerm] = useState("");
  const [replacement, setReplacement] = useState("");

  const submit = () => {
    if (!term.trim() || !replacement.trim()) {
      toast.error("Both the term and its translation are required");
      return;
    }
    addEntry({ term: term.trim(), replacement: replacement.trim() });
    setTerm("");
    setReplacement("");
    toast.success("Glossary entry added");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dictionary</DialogTitle>
          <DialogDescription>
            Lock in character names and recurring terms so every page translates
            consistently.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {dictionary.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="truncate font-medium">{entry.term}</span>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
                <span className="truncate text-muted-foreground">{entry.replacement}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive"
                aria-label={`Delete ${entry.term}`}
                onClick={() => deleteEntry(entry.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {dictionary.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No entries yet — add your first term below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dict-term">Original term</Label>
            <Input id="dict-term" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dict-repl">Approved translation</Label>
            <Input
              id="dict-repl"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
            />
          </div>
          <Button onClick={submit} className="gap-1.5">
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
