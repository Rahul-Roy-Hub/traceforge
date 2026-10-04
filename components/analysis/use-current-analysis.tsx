"use client";

import { notFound } from "next/navigation";
import { useAnalysisStore } from "@/lib/analysis-store";
import { getAnalysisById } from "@/lib/mock-data";
import type { AnalysisRecord } from "@/lib/types";

export function useCurrentAnalysis(id: string): AnalysisRecord {
  const { getAnalysis } = useAnalysisStore();
  return getAnalysis(id) ?? getAnalysisById(id);
}

export function AnalysisGate({
  analysisId,
  children,
}: {
  analysisId: string;
  children: (analysis: AnalysisRecord) => React.ReactNode;
}) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) {
    notFound();
  }
  return <>{children(analysis)}</>;
}
