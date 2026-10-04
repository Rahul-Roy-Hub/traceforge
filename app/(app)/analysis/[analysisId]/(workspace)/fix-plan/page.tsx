import { FixPlanView } from "@/components/analysis/fix-plan-view";

export default async function Page({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <FixPlanView analysisId={analysisId} />;
}
