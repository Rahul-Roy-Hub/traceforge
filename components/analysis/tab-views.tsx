"use client";

import { ReproductionSteps, ReferencesList, ValidationChecklist } from "@/components/analysis/supporting-cards";
import { useCurrentAnalysis } from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";

export function ReproductionView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Reproduction"
      title="Reproduction"
      description="Steps that recreate the failure from the original evidence."
    >
      <ReproductionSteps analysis={analysis} />
    </WorkspacePage>
  );
}

export function ValidationView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Validation"
      title="Validation"
      description="Confirm the fix with a short checklist before shipping."
    >
      <ValidationChecklist analysis={analysis} />
    </WorkspacePage>
  );
}

export function ReferencesView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="References"
      title="References"
      description="Docs and notes that support this diagnosis."
    >
      <ReferencesList analysis={analysis} />
    </WorkspacePage>
  );
}
