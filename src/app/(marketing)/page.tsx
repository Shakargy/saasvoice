import Link from "next/link";
import {
  FileText,
  Mic,
  ShieldCheck,
  Layers,
  CalendarClock,
  Download,
  Check,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Changelog → content",
    body: "Paste a raw update — a bug fix, a shipped feature, a metric — and get posts you can actually use.",
  },
  {
    icon: Mic,
    title: "Founder voice, 5 ways",
    body: "Five distinct angles per update: punchy, founder progress, educational, storytelling, opinionated.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-AI Voice Score",
    body: "Every draft is scored for generic phrasing, buzzwords, and weak hooks — with reasons and fixes.",
  },
  {
    icon: Layers,
    title: "Edit & keep the best",
    body: "Tweak, save, approve, and copy. Keep the ones that sound like you and bin the rest.",
  },
  {
    icon: CalendarClock,
    title: "Weekly queue",
    body: "Line up approved posts with a planned date so you always have something ready to ship.",
  },
  {
    icon: Download,
    title: "Copy & CSV export",
    body: "Your content is portable. Copy a post in one tap or export everything to a spreadsheet.",
  },
];

const steps = [
  {
    n: "01",
    title: "Drop in an update",
    body: "Shipped a feature? Fixed a bug? Learned something? Jot the raw notes — no polish needed.",
  },
  {
    n: "02",
    title: "Generate 5 angles",
    body: "SaaSVoice writes five founder-style takes, each scored for how human (vs. ChatGPT) it sounds.",
  },
  {
    n: "03",
    title: "Tweak, copy, ship",
    body: "Pick your favourite, make it yours, and copy or queue it. Done in under a minute.",
  },
];

const useCases = [
  "New feature launch",
  "Bug fix → lesson",
  "Customer insight",
  "Metric update",
  "Founder opinion",
  "Technical decision",
  "Weekly recap",
];

const faqs = [
  {
    q: "Is this just another AI post generator?",
    a: "No. The difference is the Anti-AI Voice Score — a deterministic check that flags generic, buzzword-heavy, ChatGPT-sounding drafts before you publish, and tells you how to make them specific.",
  },
  {
    q: "Does it post to X or LinkedIn for me?",
    a: "Not yet. SaaSVoice focuses on writing better content. You copy or export posts today. Direct posting is planned as a premium add-on because platform APIs cost money.",
  },
  {
    q: "Will it invent fake metrics or customers?",
    a: "Never. It only works with the details you give it. No numbers in? No numbers out.",
  },
  {
    q: "Do I need an API key to try it?",
    a: "No. It ships with a mock generator so you can run the whole app with zero keys. Add a Gemini key when you want live generation.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob bg-accent left-1/2 top-[-6rem] h-72 w-72 -translate-x-1/2" />
        <div className="blob bg-accent-2 right-[-4rem] top-32 h-64 w-64" />
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 gap-1.5 py-1">
            <Sparkles className="size-3 text-accent" />
            For founders, indie hackers & technical creators
          </Badge>
          <h1 className="font-display text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Your SaaS updates deserve{" "}
            <span className="text-gradient">better posts.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            SaaSVoice turns product updates, changelogs, launches, and lessons
            into founder-style posts that sound human — not like a robot wrote
            them.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">
                Start free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#how">See how it works</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card. Never stare at a blank post box again.
          </p>

          <HeroDemo />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="What you get"
          title="Everything you need to post like a founder"
          subtitle="Not a scheduler. A writing engine tuned for credible, specific, founder-led content."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="card-hover">
              <CardHeader>
                <span className="bg-accent/12 mb-1 flex size-11 items-center justify-center rounded-xl">
                  <f.icon className="size-5 text-accent" />
                </span>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {f.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden py-20">
        <div className="blob bg-accent-2 left-[-4rem] top-20 h-64 w-64 opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="How it works"
            title="From raw note to founder post in 3 steps"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.n} className="card-hover relative overflow-hidden">
                <CardContent className="space-y-3">
                  <span className="font-display text-5xl font-bold text-accent/25">
                    {s.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Not another scheduler */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Card className="glow-accent border-accent/30 overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
            <Badge variant="default">Not another scheduler</Badge>
            <h2 className="font-display max-w-2xl text-2xl font-bold tracking-tight md:text-3xl">
              Schedulers move posts around. We help you write the ones worth
              moving.
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              SaaSVoice isn&apos;t here to replace Buffer or Hootsuite. The
              writing is the hard part — specific, human, unmistakably yours —
              so that&apos;s what we obsess over.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Use cases"
          title="If it happened while building, it can become a post"
        />
        <div className="flex flex-wrap justify-center gap-2.5">
          {useCases.map((u) => (
            <div
              key={u}
              className="card-hover flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm"
            >
              <Check className="size-4 text-accent" />
              {u}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Upgrade when you're shipping weekly."
        />
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span>Free</span>
                <span className="font-display text-3xl font-bold">$0</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <PricingLine>30 generation runs / month</PricingLine>
              <PricingLine>1 product profile</PricingLine>
              <PricingLine>Anti-AI Voice Score</PricingLine>
              <PricingLine>Copy & CSV export</PricingLine>
              <Button asChild className="mt-3 w-full">
                <Link href="/register">Start free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glow-accent border-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pro</span>
                <Badge variant="default">Coming soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <PricingLine>More generations</PricingLine>
              <PricingLine>Brand voice memory</PricingLine>
              <PricingLine>Content queue & planning</PricingLine>
              <PricingLine>Direct posting integrations</PricingLine>
              <Button disabled variant="outline" className="mt-3 w-full">
                Coming soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="space-y-3">
          {faqs.map((item) => (
            <Card key={item.q} className="card-hover">
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-4">
        <Card className="glow-accent border-accent/30 relative overflow-hidden">
          <div className="blob bg-accent right-10 top-[-3rem] h-48 w-48" />
          <CardContent className="relative flex flex-col items-center gap-5 py-10 text-center">
            <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Stop writing posts that sound like everyone else.
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Turn your next product update into a post that sounds like you
              wrote it — because you did.
            </p>
            <Button asChild size="lg">
              <Link href="/register">
                Start free <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-accent mb-2 text-sm font-semibold uppercase tracking-wider">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function PricingLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-accent/15 flex size-5 shrink-0 items-center justify-center rounded-full">
        <Check className="size-3 text-accent" />
      </span>
      <span>{children}</span>
    </div>
  );
}

/** A small before/after card that sells the Anti-AI Voice Score on the hero. */
function HeroDemo() {
  return (
    <div className="mx-auto mt-14 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
      <Card className="border-destructive/30">
        <CardContent className="space-y-3 py-5">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <X className="size-4" /> Generic AI
          </div>
          <p className="text-sm text-muted-foreground">
            &ldquo;🚀 Excited to announce a game-changing update that will
            supercharge your workflow and unlock new potential!&rdquo;
          </p>
          <Badge variant="destructive">82% generic</Badge>
        </CardContent>
      </Card>
      <Card className="glow-accent border-accent/40">
        <CardContent className="space-y-3 py-5">
          <div className="text-accent flex items-center gap-2 text-sm font-medium">
            <Check className="size-4" /> Founder voice
          </div>
          <p className="text-sm">
            &ldquo;First dashboard load was 6s because we fetched everything on
            mount. Cached the summary — now it&apos;s 1.8s. Small fix, big
            difference.&rdquo;
          </p>
          <Badge variant="success">91% human</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
