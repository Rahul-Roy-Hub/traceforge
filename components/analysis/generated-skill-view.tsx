"use client";

import { useEffect } from "react";
import { useCurrentAnalysis } from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";
import { SkillWorkspace } from "@/components/skills/skill-workspace";
import { useAnalysisStore } from "@/lib/analysis-store";
import { getSkillById } from "@/lib/mock-data";
import type { Analysis } from "@/lib/schemas";
import type { SkillRecord } from "@/lib/types";

export function GeneratedSkillView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  const { getSkill, upsertSkill } = useAnalysisStore();
  const skill = getSkill(analysis.skillId) ?? getSkillById(analysis.skillId);

  useEffect(() => {
    if (!analysis.apiAnalysis) return;
    void generate(analysis.apiAnalysis, analysis.skillId, upsertSkill);
  }, [analysis.apiAnalysis, analysis.skillId, upsertSkill]);

  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Generated Skill"
      title="Generated Agent Skill"
      description=""
      hideTitle
    >
      <SkillWorkspace skill={skill} />
    </WorkspacePage>
  );
}

async function generate(
  analysis: Analysis,
  skillId: string,
  upsertSkill: (skill: SkillRecord) => void,
) {
  try {
    const response = await fetch("/api/generate-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as {
      skillName: string;
      skillContent: string;
      troubleshooting?: string;
      package?: { files: { path: string; content: string }[] };
    };
    upsertSkill({
      id: skillId,
      name: data.skillName,
      category: "Module Resolution",
      description: analysis.summary,
      visibility: "Private",
      updated: "just now",
      files:
        data.package?.files?.map((file) => ({
          path: file.path.replace(/^skills\/[^/]+\//, ""),
          content: file.content,
        })) ?? [
          { path: "SKILL.md", content: data.skillContent },
          {
            path: "references/troubleshooting.md",
            content: data.troubleshooting ?? "",
          },
        ],
    });
  } catch {
    // Keep mock skill.
  }
}
