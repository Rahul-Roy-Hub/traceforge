"use client";

import { AnalysisHeader } from "@/components/analysis/analysis-header";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { PageHeader } from "@/components/layout/page-header";

export function WorkspacePage({
  analysisId,
  page,
  title,
  description,
  actions,
  children,
  from = "history",
  hideTitle = false,
}: {
  analysisId: string;
  page: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  from?: "history" | "new";
  hideTitle?: boolean;
}) {
  return (
    <div>
      <AnalysisHeader
        crumbs={[
          {
            href: from === "new" ? "/new-analysis" : "/history",
            label: from === "new" ? "New Analysis" : "History",
          },
          { href: `/analysis/${analysisId}`, label: "Analysis Result" },
          { label: page },
        ]}
      />
      <AnalysisTabs analysisId={analysisId} />
      {hideTitle ? null : (
        <PageHeader title={title} description={description} actions={actions} />
      )}
      {children}
    </div>
  );
}
