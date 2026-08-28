import { KeyRound, UploadCloud, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

const steps = [
  { icon: KeyRound, titleKey: "step1Title", descKey: "step1Desc" },
  { icon: UploadCloud, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: Languages, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

export function Onboarding() {
  const { t } = useI18n();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("howItWorks")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {t("howItWorksSub")}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <Card
            key={step.titleKey}
            className="relative overflow-hidden transition-colors hover:border-primary/50"
          >
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <step.icon className="size-5" />
                </div>
                <span className="text-4xl font-bold text-muted-foreground/25">
                  {i + 1}
                </span>
              </div>
              <h2 className="text-base font-semibold">{t(step.titleKey)}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(step.descKey)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
