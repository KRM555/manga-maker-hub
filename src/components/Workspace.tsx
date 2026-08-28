import { useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Replace,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudio, type StudioPage } from "@/lib/studio";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function Workspace({ onReanalyze }: { onReanalyze: () => void }) {
  const {
    pages,
    activePage,
    setActivePage,
    setView,
    tags,
    updateParagraph,
    moveParagraph,
    replaceInPage,
    replaceInAll,
  } = useStudio();
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const [showOverlays, setShowOverlays] = useState(true);

  const page = pages[activePage];
  if (!page) return null;

  const wrap = (text: string, tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag ? `${tag.prefix}${text}${tag.suffix}` : text;
  };

  const serialize = (p: StudioPage, field: "original" | "translated") =>
    `# ${p.name}\n\n` +
    p.paragraphs
      .map((par, i) =>
        field === "translated"
          ? `${i + 1}. ${wrap(par.translated, par.tagId)}`
          : `${i + 1}. ${par.original}`,
      )
      .join("\n");

  const exportField = (field: "original" | "translated", scope: "page" | "all") => {
    const content =
      scope === "page"
        ? serialize(page, field)
        : pages.map((p) => serialize(p, field)).join("\n\n");
    download(
      `${field === "original" ? "ocr" : "translation"}-${scope === "page" ? `page-${activePage + 1}` : "all-pages"}.txt`,
      content,
    );
    toast.success("Export ready");
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView("upload")}>
            <ArrowLeft className="size-4 rtl:rotate-180" /> Back to Upload
          </Button>

          <div className="flex flex-wrap items-center gap-1.5">
            {pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  i === activePage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                Page #{i + 1} of {pages.length}
              </button>
            ))}
          </div>

          <div className="ms-auto flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onReanalyze}>
              <RefreshCw className="size-4" /> Re-analyze
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="size-4" /> Export Original OCR
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportField("original", "page")}>
                  Current page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportField("original", "all")}>
                  All pages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Download className="size-4" /> Export Translated Text
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportField("translated", "page")}>
                  Current page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportField("translated", "all")}>
                  All pages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search & replace */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-9 w-40 sm:w-56"
          />
          <Input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replace with…"
            className="h-9 w-40 sm:w-56"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const n = replaceInPage(activePage, search, replace);
              toast.success(`${n} replacement(s) in this page`);
            }}
          >
            <Replace className="size-4" /> In this page
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const n = replaceInAll(search, replace);
              toast.success(`${n} replacement(s) across all pages`);
            }}
          >
            <Replace className="size-4" /> In all pages
          </Button>
        </div>
      </div>

      {/* Dual panels */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">{page.name}</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowOverlays((v) => !v)}
            >
              {showOverlays ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showOverlays ? "Hide overlays" : "Show overlays"}
            </Button>
          </div>
          <div className="relative max-h-[70vh] overflow-auto rounded-lg bg-muted/40">
            <img src={page.url} alt={page.name} className="w-full" />
            {showOverlays && (
              <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 p-3">
                {page.paragraphs.map((par, i) => (
                  <span
                    key={par.id}
                    className="w-fit rounded-md bg-primary/85 px-2 py-1 text-xs font-medium text-primary-foreground shadow"
                  >
                    #{i + 1} {par.translated.slice(0, 40)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto pe-1">
          {page.paragraphs.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No text was extracted from this page.
            </p>
          )}
          {page.paragraphs.map((par, i) => (
            <Card key={par.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Paragraph {i + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Move up"
                    onClick={() => moveParagraph(page.id, i, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Move down"
                    onClick={() => moveParagraph(page.id, i, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Select
                    value={par.tagId}
                    onValueChange={(v) => updateParagraph(page.id, par.id, { tagId: v })}
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} {tag.prefix}…{tag.suffix}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ms-auto gap-1.5"
                    onClick={() => {
                      void navigator.clipboard.writeText(wrap(par.translated, par.tagId));
                      toast.success("Paragraph copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy Paragraph
                  </Button>
                </div>

                <Textarea
                  value={par.original}
                  onChange={(e) =>
                    updateParagraph(page.id, par.id, { original: e.target.value })
                  }
                  placeholder="Original text"
                  className="min-h-20 text-sm"
                />
                <Textarea
                  value={par.translated}
                  onChange={(e) =>
                    updateParagraph(page.id, par.id, { translated: e.target.value })
                  }
                  placeholder="Translated text"
                  className="min-h-20 text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
