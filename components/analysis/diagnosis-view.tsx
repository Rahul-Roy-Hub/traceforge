"use client";

import { EvidenceCard, ExplanationCard, IssueDetectedCard } from "@/components/analysis/explanation-cards";
import { useCurrentAnalysis } from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";

export function DiagnosisView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Detailed Explanation"
      title="Detailed Explanation"
      description="A deeper look at the issue, evidence and reasoning."
    >
      <div className="space-y-4">
        <IssueDetectedCard analysis={analysis} />
        <EvidenceCard analysis={analysis} />
        <ExplanationCard title="What is happening" icon="light" tone="warning">
          <p>
            The build process is trying to resolve the module{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
              {analysis.error.replace("Cannot find module ", "").replace(/'/g, "") || "@components/Button"}
            </code>{" "}
            but cannot find it.
          </p>
          <p>{analysis.whatIsHappening}</p>
        </ExplanationCard>
        <ExplanationCard title="Why this is likely" icon="target" tone="primary">
          <p>{analysis.whyLikely}</p>
        </ExplanationCard>
        <ExplanationCard title="Additional Context" icon="info" tone="info">
          <p>{analysis.additionalContext}</p>
        </ExplanationCard>
      </div>
    </WorkspacePage>
  );
}
