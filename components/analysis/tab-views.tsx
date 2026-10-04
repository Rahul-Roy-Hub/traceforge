"use client";

import { ReproductionSteps, ReferencesList, ValidationChecklist } from "@/components/analysis/supporting-cards";
import {
  AnalysisLoading,
  useCurrentAnalysis,
} from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";

export function ReproductionView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) return <AnalysisLoading />;
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Reproduction"
      title="Reproduction"
      description="Steps that recreate the failure from the original evidence."
    >
      {analysis.reproductionSteps.length ? (
        <ReproductionSteps analysis={analysis} />
      ) : (
        <p className="text-sm text-muted-foreground">No reproduction steps were returned.</p>
      )}
    </WorkspacePage>
  );
}

export function ValidationView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) return <AnalysisLoading />;
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Validation"
      title="Validation"
      description="Confirm the fix with a short checklist before shipping."
    >
      {analysis.validationChecklist.length ? (
        <ValidationChecklist analysis={analysis} />
      ) : (
        <p className="text-sm text-muted-foreground">No validation checklist was returned.</p>
      )}
    </WorkspacePage>
  );
}

export function ReferencesView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) return <AnalysisLoading />;
  return (
    <WorkspacePage
      analysisId={analysisId}
      page="References"
      title="References"
      description="Unknowns and gaps from the live diagnosis."
    >
      {analysis.references.length ? (
        <ReferencesList analysis={analysis} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No unknowns were reported for this analysis.
        </p>
      )}
    </WorkspacePage>
  );
}
