import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Onboarding } from "@/components/Onboarding";
import { UploadSection } from "@/components/UploadSection";
import { Workspace } from "@/components/Workspace";
import { StudioProvider, useStudio } from "@/lib/studio";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Manhwa Transtool Studio — AI Manga Translation Workspace" },
      {
        name: "description",
        content:
          "Upload manga and manhwa pages, extract text with AI, manage dictionaries and tags, and export consistent translations — bilingual EN/AR interface.",
      },
      {
        property: "og:title",
        content: "Manhwa Transtool Studio — AI Manga Translation Workspace",
      },
      {
        property: "og:description",
        content:
          "Upload pages, extract text, translate with AI, and export — with dictionary and tag management for consistent results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <StudioProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
              <StudioBody />
            </main>
          </div>
          <Toaster />
        </StudioProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function StudioBody() {
  const { view, setView } = useStudio();
  return (
    <>
      <div className={view === "workspace" ? "hidden" : undefined}>
        <Onboarding />
        <UploadSection />
      </div>
      {view === "workspace" && (
        <Workspace
          onReanalyze={() => {
            setView("upload");
            toast.info("Adjust your settings, then run Analyze again");
          }}
        />
      )}
    </>
  );
}
