"use client";

import { FixPlan } from "@/components/analysis/fix-plan";
import { useCurrentAnalysis } from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";

export function FixPlanView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Suggested Fix"
      title="Suggested Fix"
      description="Follow these steps to fix the issue. You can copy the code and apply it directly."
      from="new"
    >
      <FixPlan analysis={analysis} />
    </WorkspacePage>
  );
}
