"use client";

import { EvidenceCard, ExplanationCard, IssueDetectedCard } from "@/components/analysis/explanation-cards";
import {
  AnalysisLoading,
  useCurrentAnalysis,
} from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";

export function DiagnosisView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) return <AnalysisLoading />;

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
