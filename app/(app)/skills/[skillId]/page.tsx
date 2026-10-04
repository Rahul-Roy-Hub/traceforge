import { SkillDetailPage } from "@/components/skills/skill-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  return <SkillDetailPage skillId={skillId} />;
}
