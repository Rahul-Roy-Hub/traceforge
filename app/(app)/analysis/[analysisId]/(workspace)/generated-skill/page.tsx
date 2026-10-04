import { GeneratedSkillView } from "@/components/analysis/generated-skill-view";

export default async function Page({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <GeneratedSkillView analysisId={analysisId} />;
}
