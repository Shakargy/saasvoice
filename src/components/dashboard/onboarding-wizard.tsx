"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductProfileForm } from "@/components/forms/product-profile-form";
import { ProductUpdateForm } from "@/components/forms/product-update-form";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ["Welcome", "Your product", "First update", "Ready"];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);

  function finish() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="blob bg-accent left-1/2 top-[-3rem] h-48 w-48 -translate-x-1/2 opacity-40" />

      {/* Progress */}
      <div className="relative mb-8 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < step && "bg-accent text-accent-foreground",
                  i === step && "bg-accent/20 text-accent ring-2 ring-accent",
                  i > step && "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[0.65rem] sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span
                className={cn(
                  "mb-4 h-px w-6 sm:w-10",
                  i < step ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="glow-accent border-accent/20 relative overflow-hidden">
        <CardContent className="py-7">
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}

          {step === 1 && (
            <div className="space-y-5">
              <StepHeader
                title="Set up your product"
                subtitle="This shapes the voice of every post. You can edit it anytime."
              />
              <ProductProfileForm onCreated={() => setStep(2)} embedded />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepHeader
                title="Add your first update"
                subtitle="A shipped feature, a bug fix, a lesson — whatever you did recently. Raw notes are fine."
              />
              <ProductUpdateForm onDone={() => setStep(3)} embedded />
              <button
                onClick={() => setStep(3)}
                className="text-muted-foreground mx-auto block text-xs hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 3 && <DoneStep onFinish={finish} />}
        </CardContent>
      </Card>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <span className="bg-gradient-accent flex size-16 items-center justify-center rounded-2xl shadow-lg">
        <Sparkles className="size-8 text-accent-foreground" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome to SaaSVoice
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md">
          Let&apos;s get you posting like a founder in two quick steps. First
          your product, then your first update — and you&apos;ll be generating
          posts in under a minute.
        </p>
      </div>
      <Button size="lg" onClick={onNext}>
        Let&apos;s go <ArrowRight />
      </Button>
    </div>
  );
}

function DoneStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <span className="bg-gradient-accent flex size-16 items-center justify-center rounded-2xl shadow-lg">
        <PartyPopper className="size-8 text-accent-foreground" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          You&apos;re all set
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md">
          Your workspace is ready. Head to your dashboard to generate
          founder-style posts from your updates.
        </p>
      </div>
      <Button size="lg" onClick={onFinish}>
        Go to dashboard <ArrowRight />
      </Button>
    </div>
  );
}

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1 text-center">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );
}
