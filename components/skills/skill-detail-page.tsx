"use client";

import { SkillWorkspace } from "@/components/skills/skill-workspace";
import { useAnalysisStore } from "@/lib/analysis-store";
import { notFound } from "next/navigation";

export function SkillDetailPage({ skillId }: { skillId: string }) {
  const { getSkill, ready } = useAnalysisStore();
  const skill = getSkill(skillId);

  if (!ready) {
    return <p className="p-6 text-sm text-muted-foreground">Loading skill...</p>;
  }
  if (!skill) {
    notFound();
  }

  return (
    <SkillWorkspace
      skill={skill}
      heading={skill.name}
      description={skill.description}
      validation={skill.validation}
    />
  );
}
