import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  Layers3,
  ScanSearch,
  Sparkles,
  Upload,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Multimodal understanding", icon: ScanSearch },
  { title: "Detailed diagnostics", icon: FileSearch },
  { title: "Step-by-step fix plan", icon: Wrench },
  { title: "Generate reusable skills", icon: Sparkles },
  { title: "Export as Agent Skills", icon: Layers3 },
];

const steps = [
  {
    title: "Upload",
    body: "Share a screenshot, error log or describe the problem.",
  },
  {
    title: "AI Analysis",
    body: "Gemma 4 understands the issue, explains the cause and suggests a fix.",
  },
  {
    title: "Fix Plan",
    body: "Get a clear, step-by-step solution with commands, code changes and references.",
  },
  {
    title: "Reusable Skill",
    body: "Export as an Agent Skill to use with your tools and share with your team.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          TraceForge
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#examples">Examples</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <Button asChild className="rounded-full">
          <Link href="/new-analysis">
            Get Started
            <ArrowRight />
          </Link>
        </Button>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
            Powered by Gemma 4
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Turn a screenshot
            <br />
            of a problem into
            <br />
            a reusable <span className="text-primary">AI Skill.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Upload a screenshot, error log or description. TraceForge uses Gemma 4
            to understand the issue, explain the cause, suggest a fix, and generate
            a reusable Agent Skill.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/new-analysis">
                Try it now
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/new-analysis">Start an analysis</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative space-y-4">
            <div className="rounded-2xl bg-editor p-5 text-editor-foreground shadow-xl">
              <p className="text-xs text-white/50">GitHub Actions • Deploy Production</p>
              <p className="mt-3 font-semibold text-red-400">Build failed</p>
              <p className="mt-2 font-mono text-sm text-red-300">
                Error: Cannot find module
                <br />
                &apos;@components/Button&apos;
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">Generated Agent Skill</p>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                debug-module-resolution/
                <br />
                SKILL.md
                <br />
                references/
                <br />
                scripts/
              </p>
            </div>
            <div className="rounded-2xl bg-primary-light px-4 py-3 text-sm font-medium text-primary">
              Reusable skill
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-5">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-border bg-card p-4">
            <feature.icon className="mb-3 size-5 text-primary" />
            <p className="font-medium">{feature.title}</p>
          </div>
        ))}
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl font-bold">How it works</h2>
        <p className="mt-2 text-muted-foreground">
          From a screenshot to a reusable Agent Skill in seconds.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="relative rounded-2xl border border-border bg-card p-5">
              <span className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              {index === 0 ? <Upload className="mt-4 size-4 text-primary" /> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="examples" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-border bg-muted p-8">
          <h2 className="text-2xl font-bold">Run a live analysis</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload a screenshot, paste a log, and let Gemma 4 produce an evidence-backed
            diagnosis and reusable Agent Skill.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link href="/new-analysis">Open New Analysis</Link>
          </Button>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-border p-8">
          <h2 className="text-2xl font-bold">Hackathon access</h2>
          <p className="mt-2 text-muted-foreground">
            Set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">GEMINI_API_KEY</code>{" "}
            and analyze a screenshot with Gemma 4. No mock diagnoses are shown.
          </p>
        </div>
      </section>
    </div>
  );
}
