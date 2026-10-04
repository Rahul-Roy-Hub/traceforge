"use client";

import { notFound } from "next/navigation";
import { useAnalysisStore } from "@/lib/analysis-store";
import type { AnalysisRecord } from "@/lib/types";

export function useCurrentAnalysis(id: string): AnalysisRecord | null {
  const { getAnalysis, ready } = useAnalysisStore();
  if (!ready) return null;
  const analysis = getAnalysis(id);
  if (!analysis) {
    notFound();
  }
  return analysis;
}

export function AnalysisLoading() {
  return (
    <p className="p-6 text-sm text-muted-foreground">Loading analysis...</p>
  );
}
