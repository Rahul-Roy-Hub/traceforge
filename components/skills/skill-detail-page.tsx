"use client";

import { SkillWorkspace } from "@/components/skills/skill-workspace";
import { useAnalysisStore } from "@/lib/analysis-store";
import { getSkillById } from "@/lib/mock-data";

export function SkillDetailPage({ skillId }: { skillId: string }) {
  const { getSkill } = useAnalysisStore();
  const skill = getSkill(skillId) ?? getSkillById(skillId);
  return <SkillWorkspace skill={skill} heading={skill.name} description={skill.description} />;
}
