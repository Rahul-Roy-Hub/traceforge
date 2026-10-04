import { Boxes, Info, Lightbulb, ListChecks, Target } from "lucide-react";
import { CategoryBadge } from "@/components/common/category-badge";
import type { AnalysisRecord } from "@/lib/types";

export function IssueDetectedCard({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Boxes className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Issue Type</p>
            <div className="mt-1">
              <CategoryBadge category={analysis.issueType} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
            {analysis.confidence}
          </p>
        </div>
      </div>
    </div>
  );
}

export function EvidenceCard({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-info-bg text-info">
          <ListChecks className="size-4" />
        </span>
        <h3 className="text-lg font-semibold">Evidence</h3>
      </header>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {analysis.evidence.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              {item.includes("`") ? item : item.replace(/'([^']+)'/g, "`$1`")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExplanationCard({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: "light" | "target" | "info";
  tone: "warning" | "primary" | "info";
  children: React.ReactNode;
}) {
  const Icon = icon === "light" ? Lightbulb : icon === "target" ? Target : Info;
  const colors = {
    warning: "bg-warning-bg text-warning",
    primary: "bg-primary-light text-primary",
    info: "bg-info-bg text-info",
  }[tone];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-3 flex items-center gap-2">
        <span className={`inline-flex size-9 items-center justify-center rounded-xl ${colors}`}>
          <Icon className="size-4" />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </header>
      <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
