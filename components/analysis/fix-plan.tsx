import { CodeBlock } from "@/components/analysis/code-block";
import type { AnalysisRecord } from "@/lib/types";

export function FixPlan({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <div className="relative space-y-8">
      <span className="absolute top-4 bottom-4 left-[18px] w-px bg-border" />
      {analysis.fixSteps.map((step, index) => (
        <div key={step.title} className="relative pl-14">
          <span className="absolute left-0 inline-flex size-9 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <h3 className="text-xl font-semibold">{step.title}</h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{step.description}</p>
          <CodeBlock filename={step.filename} code={step.code} />
        </div>
      ))}
    </div>
  );
}
