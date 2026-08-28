import { Languages, Moon, Sun, BookMarked, Tags, KeyRound, FolderPlus, LogIn, PanelsTopLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import { useStudio } from "@/lib/studio";
import { AuthDialog } from "@/components/dialogs/AuthDialog";
import { DictionaryDialog } from "@/components/dialogs/DictionaryDialog";
import { TagsDialog } from "@/components/dialogs/TagsDialog";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { apiKey, setApiKey, setPages, setView, setActivePage } = useStudio();
  const [authOpen, setAuthOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 h-auto max-w-7xl flex-nowrap items-center gap-2 overflow-hidden px-4 py-2.5 sm:gap-3 sm:px-6">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PanelsTopLeft className="size-5" />
            </div>
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
