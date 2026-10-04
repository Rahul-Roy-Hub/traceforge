"use client";

import Link from "next/link";
import { Download, Save, Sparkles } from "lucide-react";
import { AnalysisHeader } from "@/components/analysis/analysis-header";
import { AnalysisTimeline } from "@/components/analysis/analysis-timeline";
import { OriginalInputCard } from "@/components/analysis/original-input-card";
import {
  AnalysisLoading,
  useCurrentAnalysis,
} from "@/components/analysis/use-current-analysis";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export function AnalysisResultView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  if (!analysis) return <AnalysisLoading />;

  return (
    <div>
      <AnalysisHeader
        crumbs={[
          { href: "/new-analysis", label: "New Analysis" },
          { label: "Analysis Result" },
        ]}
      />
      <PageHeader
        title="Analysis Result"
        description="Here's what I found based on the screenshot and description."
        actions={
          <>
            <Button variant="outline">
              <Save />
              Save
            </Button>
            <Button>
              <Download />
              Export Draft
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <OriginalInputCard analysis={analysis} />
        <AnalysisTimeline analysis={analysis} />
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-primary-light/50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-primary" />
            Need more help?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow the suggested fix, then generate a reusable Agent Skill with Gemma 4.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href={`/analysis/${analysis.id}/fix-plan`}>
            Generate Fix Plan →
          </Link>
        </Button>
      </div>
    </div>
  );
}
