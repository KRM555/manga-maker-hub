import { Languages, Moon, Sun, BookMarked, Tags, KeyRound, FolderPlus, LogIn, ExternalLink, Menu, Save } from "lucide-react";
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

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-14.364a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
    </svg>
  );
}


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
        <div className="mx-auto flex h-16 max-w-7xl flex-nowrap items-center gap-2 overflow-hidden px-4 sm:gap-3 sm:px-6">
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
              src="/favicon.png"
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

          {/* Gemini API Key (masked) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex min-w-0 flex-1 items-center justify-center px-2">
                <div className="relative min-w-0 max-w-md flex-1">
                  <KeyRound className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t("geminiApiKeyPlaceholder")}
                    aria-label={t("geminiApiKey")}
                    className="h-9 w-full min-w-0 rounded-e-none ps-8 pe-3 text-xs"
                  />
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("tooltipGetApiKey")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-s-md border border-s-0 border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </TooltipTrigger>
            <TooltipContent>{t("tooltipApiKey")}</TooltipContent>
          </Tooltip>

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

            {/* Discord */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  aria-label={t("discord")}
                  className="size-9 shrink-0"
                >
                  <a
                    href="https://discord.gg/nuaqTHvx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DiscordIcon className="size-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tooltipDiscord")}</TooltipContent>
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
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <DictionaryDialog open={dictOpen} onOpenChange={setDictOpen} />
      <TagsDialog open={tagsOpen} onOpenChange={setTagsOpen} />
    </TooltipProvider>
  );
}
