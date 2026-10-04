import { DiagnosisView } from "@/components/analysis/diagnosis-view";

export default async function Page({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <DiagnosisView analysisId={analysisId} />;
}
