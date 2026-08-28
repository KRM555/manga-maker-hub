import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileImage, FileArchive, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useStudio } from "@/lib/studio";
import { extractPage } from "@/lib/gemini";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ACCEPTED = [".zip", ".png", ".jpg", ".jpeg", ".webp"];

const targetLanguages: { value: string; labelKey: TranslationKey }[] = [
  { value: "ar", labelKey: "langArabic" },
  { value: "en", labelKey: "langEnglish" },
  { value: "ja", labelKey: "langJapanese" },
  { value: "ko", labelKey: "langKorean" },
];

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

export function UploadSection() {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [extractSfx, setExtractSfx] = useState(true);
  const [detectVertical, setDetectVertical] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const {
    apiKey,
    tags,
    dictionary,
    setPages,
    setActivePage,
    setView,
    targetLang,
    setTargetLang,
    newUid,
  } = useStudio();

  const langLabel: Record<string, string> = {
    ar: "Arabic",
    en: "English",
    ja: "Japanese",
    ko: "Korean",
  };

  const analyze = async () => {
    if (!apiKey.trim()) {
      toast.error("Gemini API key is missing", {
        description: "Paste your key in the header field to enable AI extraction.",
      });
      return;
    }
    const images = files.filter((f) =>
      IMAGE_EXT.some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    if (images.length === 0) {
      toast.error("Upload at least one page image (PNG, JPG or WEBP)");
      return;
    }
    if (!targetLang) {
      toast.error("Select a target language first");
      return;
    }

    setIsRunning(true);
    const toastId = toast.loading(`Analyzing ${images.length} page(s) with Gemini…`);
    try {
      const results = [];
      for (const file of images) {
        const chunks = await extractPage({
          apiKey: apiKey.trim(),
          file,
          tags,
          dictionary,
          targetLanguage: langLabel[targetLang] ?? targetLang,
          extractSfx,
          detectVertical,
        });
        results.push({
          id: newUid(),
          name: file.name,
          url: URL.createObjectURL(file),
          paragraphs: chunks.map((c) => ({
            id: newUid(),
            original: c.original ?? "",
            translated: c.translated ?? "",
            tagId: tags.find((t) => t.id === c.tag)?.id ?? tags[0]?.id ?? "dialogue",
          })),
        });
      }
      setPages(results);
      setActivePage(0);
      setView("workspace");
      toast.success("Extraction complete", {
        id: toastId,
        description: `${results.reduce((n, p) => n + p.paragraphs.length, 0)} paragraph(s) across ${results.length} page(s).`,
      });
    } catch (err) {
      toast.error("Extraction failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const addFiles = useCallback((incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter((f) =>
      ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6">
        {/* Dropzone — full width */}
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-dropzone p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-accent"
                : "border-dropzone-border hover:border-primary/60",
            )}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UploadCloud className="size-7" />
            </div>
            <div>
              <p className="text-base font-semibold">{t("uploadTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("uploadDesc")}
              </p>
            </div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              {t("uploadFormats")}
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </button>

          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {files.some((f) => f.name.endsWith(".zip")) ? (
                  <FileArchive className="size-3.5" />
                ) : (
                  <FileImage className="size-3.5" />
                )}
                {files.length} {t("filesReady")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setFiles([])}
              >
                <X className="size-3.5" />
                {t("clearFiles")}
              </Button>
            </div>
          )}
        </div>

        {/* Settings card — full width below dropzone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("settingsTitle")}</CardTitle>
            <CardDescription>{t("settingsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="target-lang">{t("targetLanguage")}</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger id="target-lang" className="w-full">
                  <SelectValue placeholder={t("targetLanguagePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {targetLanguages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {t(l.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="extract-sfx"
                checked={extractSfx}
                onCheckedChange={(v) => setExtractSfx(v === true)}
              />
              <Label htmlFor="extract-sfx" className="cursor-pointer font-normal">
                {t("extractSfx")}
              </Label>
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="detect-vertical"
                checked={detectVertical}
                onCheckedChange={(v) => setDetectVertical(v === true)}
              />
              <Label
                htmlFor="detect-vertical"
                className="cursor-pointer font-normal"
              >
                {t("detectVertical")}
              </Label>
            </div>

            <Button
              size="lg"
              className="mt-2 w-full gap-2 text-base"
              disabled={isRunning}
              onClick={() => void analyze()}
            >
              {isRunning ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Sparkles className="size-5" />
              )}
              {t("analyze")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
