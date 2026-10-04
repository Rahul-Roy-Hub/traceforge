import { ReferencesView } from "@/components/analysis/tab-views";

export default async function Page({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <ReferencesView analysisId={analysisId} />;
}
