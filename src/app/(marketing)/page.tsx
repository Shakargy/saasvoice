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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Changelog to content",
    body: "Paste a raw update — a bug fix, a shipped feature, a metric — and get posts you can actually use.",
  },
  {
    icon: Mic,
    title: "Founder voice generation",
    body: "Five distinct angles per update: punchy, founder progress, educational, storytelling, and opinionated.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-AI voice scoring",
    body: "Every draft is scored for generic phrasing, buzzwords, and weak hooks — with reasons and fixes.",
  },
  {
    icon: Layers,
    title: "Post variations",
    body: "Edit, save, approve, and copy. Keep the ones that sound like you and drop the rest.",
  },
  {
    icon: CalendarClock,
    title: "Weekly content queue",
    body: "Line up approved posts with a planned date so you always have something ready to ship.",
  },
  {
    icon: Download,
    title: "Copy and CSV export",
    body: "Your content is portable. Copy a post in one click or export everything to a spreadsheet.",
  },
];

const useCases = [
  "New feature launch",
  "Bug fix turned into a lesson",
  "Customer insight",
  "Metric update",
  "Founder opinion",
  "Technical decision",
  "Weekly progress recap",
];

const faqs = [
  {
    q: "Is this just another AI post generator?",
    a: "No. The difference is the Anti-AI Voice Score — a deterministic check that flags generic, buzzword-heavy, ChatGPT-sounding drafts before you publish, and tells you how to make them specific.",
  },
  {
    q: "Does it post to X or LinkedIn for me?",
    a: "Not in this version. SaaSVoice focuses on writing better content. You copy or export posts today. Direct posting is planned as a premium integration because platform APIs cost money.",
  },
  {
    q: "Will it invent fake metrics or customers?",
    a: "No. It only works with the details you give it. If you don't provide numbers, it won't make them up.",
  },
  {
    q: "Do I need an API key to try it?",
    a: "No. It ships with a mock generator so you can run the whole app locally with zero keys. Add a Gemini key when you want real generation.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-6">
            For founders, indie hackers, and technical creators
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Your SaaS updates deserve better posts.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            SaaSVoice turns product updates, changelogs, launches, bug fixes,
            and lessons learned into founder-style posts that sound human.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">View demo</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Never stare at a blank post box again.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Everything you need to post like a founder
          </h2>
          <p className="mt-3 text-muted-foreground">
            Not a scheduler. A writing engine tuned for credible, specific,
            founder-led content.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="size-6 text-accent" />
                <CardTitle className="mt-2 text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {f.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Not another scheduler */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col gap-4 py-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Not another scheduler
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              SaaSVoice is not here to replace Buffer or Hootsuite. Schedulers
              move posts around. SaaSVoice helps you write the posts worth
              moving — specific, human, and unmistakably yours. The writing is
              the hard part, so that is what we obsess over.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Turn any update into a post
          </h2>
          <p className="mt-3 text-muted-foreground">
            If it happened while building, it can become content.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {useCases.map((u) => (
            <div
              key={u}
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm"
            >
              <Check className="size-4 text-accent" />
              {u}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Simple pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when you are posting every week.
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Free
                <span className="text-2xl font-semibold">$0</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <PricingLine>30 generation runs per month</PricingLine>
              <PricingLine>1 product profile</PricingLine>
              <PricingLine>Anti-AI voice scoring</PricingLine>
              <PricingLine>Copy and CSV export</PricingLine>
              <Button asChild className="mt-4 w-full">
                <Link href="/register">Start free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pro
                <Badge variant="secondary">Coming soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <PricingLine>More generations</PricingLine>
              <PricingLine>Brand voice memory</PricingLine>
              <PricingLine>Content queue and planning</PricingLine>
              <PricingLine>Direct posting integrations</PricingLine>
              <Button disabled className="mt-4 w-full" variant="outline">
                Not yet available
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">
          Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q}>
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
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
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

function PricingLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="size-4 shrink-0 text-accent" />
      <span>{children}</span>
    </div>
  );
}
