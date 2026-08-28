import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
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

export function TagsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { tags, addTag, deleteTag, restoreDefaultTags } = useStudio();
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const submit = () => {
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    addTag({ name: name.trim(), prefix, suffix });
    setName("");
    setPrefix("");
    setSuffix("");
    toast.success("Tag added");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tags Settings</DialogTitle>
          <DialogDescription>
            Define how each type of text is wrapped in the exported script.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{tag.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tag.prefix}text{tag.suffix}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                aria-label={`Delete ${tag.name}`}
                onClick={() => deleteTag(tag.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tags yet — add one or restore the defaults.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tag-name">Name</Label>
            <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-20">
            <Label htmlFor="tag-prefix">Prefix</Label>
            <Input
              id="tag-prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-20">
            <Label htmlFor="tag-suffix">Suffix</Label>
            <Input
              id="tag-suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
            />
          </div>
          <Button onClick={submit} className="gap-1.5">
            <Plus className="size-4" /> Add
          </Button>
        </div>

        <Button
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            restoreDefaultTags();
            toast.success("Default tags restored");
          }}
        >
          <RotateCcw className="size-4" /> Restore defaults
        </Button>
      </DialogContent>
    </Dialog>
  );
}
