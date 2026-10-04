import { SkillCard } from "@/components/skills/skill-card";
import type { SkillRecord } from "@/lib/types";

export function SkillGrid({ skills }: { skills: SkillRecord[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
