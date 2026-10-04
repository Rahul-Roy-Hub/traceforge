import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  FileSearch,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { AnalysisRecord } from "@/lib/types";

const steps = [
  { key: "issue", icon: AlertTriangle, color: "bg-orange-bg text-orange" },
  { key: "happening", icon: FileSearch, color: "bg-primary-light text-primary" },
  { key: "cause", icon: Lightbulb, color: "bg-warning-bg text-warning" },
  { key: "repro", icon: Code2, color: "bg-info-bg text-info" },
  { key: "fix", icon: Wrench, color: "bg-success-bg text-success" },
  { key: "validation", icon: CheckCircle2, color: "bg-success-bg text-success" },
] as const;

export function AnalysisTimeline({ analysis }: { analysis: AnalysisRecord }) {
  const content = [
    { title: "Issue Detected", body: analysis.issueDetected },
    { title: "What is Happening", body: analysis.whatIsHappening },
    { title: "Likely Cause", body: analysis.likelyCause },
    {
      title: "Reproduction Steps",
      body: analysis.reproductionSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    },
    { title: "Suggested Fix", body: analysis.suggestedFix },
    { title: "Validation Checklist", body: "" },
  ];

  return (
    <div className="relative space-y-4">
      <span className="absolute top-4 bottom-4 left-[19px] w-px bg-border" />
      {content.map((item, index) => {
        const meta = steps[index];
        const Icon = meta.icon;
        return (
          <div key={item.title} className="relative flex gap-4 rounded-2xl border border-border bg-card p-4">
            <span
              className={`relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${meta.color}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <h3 className="text-base font-semibold">{item.title}</h3>
              </div>
              {index === 5 ? (
                <ul className="mt-3 space-y-2">
                  {analysis.validationChecklist.map((check) => (
                    <li key={check} className="flex items-start gap-2 text-sm break-words text-muted-foreground">
                      <Checkbox />
                      {check}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{item.body}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
