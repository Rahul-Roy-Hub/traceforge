import { AnalysisResultView } from "@/components/analysis/analysis-result-view";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <AnalysisResultView analysisId={analysisId} />;
}
