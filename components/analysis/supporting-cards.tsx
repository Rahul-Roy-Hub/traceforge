"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { AnalysisRecord } from "@/lib/types";

export function ValidationChecklist({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold">Validation Checklist</h3>
      <ul className="space-y-3">
        {analysis.validationChecklist.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm">
            <Checkbox />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReproductionSteps({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold">Reproduction Steps</h3>
      <ol className="space-y-3">
        {analysis.reproductionSteps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-muted-foreground">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ReferencesList({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <div className="space-y-3">
      {analysis.references.map((item) => (
        <article key={item.title} className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
