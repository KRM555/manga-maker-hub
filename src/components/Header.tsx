import { Languages, Moon, Sun, KeyRound, LogIn, ExternalLink, Menu, Save } from "lucide-react";
import logoAsset from "@/assets/logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { useStudio } from "@/lib/studio";
import { toast } from "sonner";
import { AuthDialog } from "@/components/dialogs/AuthDialog";
import { DictionaryDialog } from "@/components/dialogs/DictionaryDialog";
import { TagsDialog } from "@/components/dialogs/TagsDialog";

export function Header() {
  const { t, lang, setLang, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { apiKey, setApiKey, setPages, setView, setActivePage } = useStudio();
  const [authOpen, setAuthOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState(apiKey);

  useEffect(() => {
    if (sheetOpen) setApiKeyDraft(apiKey);
  }, [sheetOpen, apiKey]);

  const saveApiKey = () => {
    const value = apiKeyDraft.trim();
    setApiKey(value); // persists to localStorage via studio context
    try {
      localStorage.setItem("mts.apiKey", JSON.stringify(value));
    } catch {
      /* ignore */
    }
    toast.success(t("apiKeySaved"), { description: t("apiKeySavedDesc") });
  };

  const startNewProject = () => {
    setPages([]);
    setActivePage(0);
    setView("upload");
    setSheetOpen(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 h-auto max-w-7xl flex-nowrap items-center gap-2 overflow-hidden px-4 py-2.5 sm:gap-3 sm:px-6">
          {/* Hamburger menu / sidebar */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={t("menu")} className="size-9 shrink-0">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("menu")}</TooltipContent>
            </Tooltip>
            <SheetContent side={dir === "rtl" ? "right" : "left"} dir={dir} className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
                <SheetDescription>{t("menuDesc")}</SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4 pb-6">
                {/* API key persistence */}
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{t("apiKeySectionTitle")}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("apiKeySectionDesc")}</p>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sidebar-api-key">{t("geminiApiKey")}</Label>
                    <Input
                      id="sidebar-api-key"
                      type="password"
                      value={apiKeyDraft}
                      onChange={(e) => setApiKeyDraft(e.target.value)}
                      placeholder={t("geminiApiKeyPlaceholder")}
                      className="text-sm"
                    />
                  </div>
                  <Button onClick={saveApiKey} className="gap-1.5">
                    <Save className="size-4" /> {t("save")}
                  </Button>
                </div>

                <Separator />

                {/* Quick actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2" onClick={startNewProject}>
                    <FolderPlus className="size-4" /> {t("newProject")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      setSheetOpen(false);
                      setTagsOpen(true);
                    }}
                  >
                    <Tags className="size-4" /> {t("tagsSettings")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      setSheetOpen(false);
                      setDictOpen(true);
                    }}
                  >
                    <BookMarked className="size-4" /> {t("dictionary")}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <img
              src={logoAsset.url}
              alt={t("appName")}
              className="size-10 shrink-0 rounded-xl object-cover"
            />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-bold tracking-tight">{t("appName")}</p>
              <p className="hidden whitespace-normal text-[11px] leading-snug text-muted-foreground md:block max-w-[180px]">
                {t("appTagline")}
              </p>
            </div>
          </div>

          <div className="ms-auto flex flex-nowrap items-center justify-end gap-2 overflow-hidden">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                  <Languages className="size-4 shrink-0" />
                  <span className="font-semibold uppercase">{lang}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("en")}>
                  English (EN)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("ar")}>
                  العربية (AR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={t("themeToggle")}
                  className="size-9 shrink-0"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("themeToggle")}</TooltipContent>
            </Tooltip>

            {/* Login / Register */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={() => setAuthOpen(true)}>
                  <LogIn className="size-4 shrink-0" />
                  <span className="hidden lg:inline">{t("loginRegister")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipLogin")}</TooltipContent>
            </Tooltip>

            {/* New Project */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => {
                    setPages([]);
                    setActivePage(0);
                    setView("upload");
                  }}
                >
                  <FolderPlus className="size-4 shrink-0" />
                  <span className="hidden lg:inline">{t("newProject")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipNewProject")}</TooltipContent>
            </Tooltip>

            {/* Dictionary */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setDictOpen(true)}>
                  <BookMarked className="size-4 shrink-0" />
                  <span className="hidden xl:inline">{t("dictionary")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipDictionary")}</TooltipContent>
            </Tooltip>

            {/* Tags Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setTagsOpen(true)}>
                  <Tags className="size-4 shrink-0" />
                  <span className="hidden xl:inline">{t("tagsSettings")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipTags")}</TooltipContent>
            </Tooltip>

            {/* Gemini API Key (masked) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex min-w-0 shrink items-center">
                  <div className="relative min-w-0 shrink">
                    <KeyRound className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t("geminiApiKeyPlaceholder")}
                      aria-label={t("geminiApiKey")}
                      className="h-9 w-32 min-w-0 rounded-r-none ps-8 pe-3 text-xs sm:w-44 md:w-56"
                    />
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("tooltipGetApiKey")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-r-md border border-l-0 border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipApiKey")}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <DictionaryDialog open={dictOpen} onOpenChange={setDictOpen} />
      <TagsDialog open={tagsOpen} onOpenChange={setTagsOpen} />
    </TooltipProvider>
  );
}
