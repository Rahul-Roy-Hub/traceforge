"use client";

import { useEffect, useState } from "react";
import {
  AnalysisLoading,
  useCurrentAnalysis,
} from "@/components/analysis/use-current-analysis";
import { WorkspacePage } from "@/components/analysis/workspace-page";
import { SkillWorkspace } from "@/components/skills/skill-workspace";
import { useAnalysisStore } from "@/lib/analysis-store";
import { readApiError } from "@/lib/api";
import { inferCategory } from "@/lib/map-analysis";
import type { Analysis } from "@/lib/schemas";
import type { SkillRecord, SkillValidation } from "@/lib/types";

export function GeneratedSkillView({ analysisId }: { analysisId: string }) {
  const analysis = useCurrentAnalysis(analysisId);
  const { getSkill, upsertSkill } = useAnalysisStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const skill = analysis ? getSkill(analysis.skillId) : undefined;

  useEffect(() => {
    if (!analysis?.apiAnalysis) return;
    if (getSkill(analysis.skillId)?.files.length) return;
    void generateSkill(analysis.apiAnalysis, analysis.skillId, upsertSkill, setError, setLoading);
  }, [analysis, getSkill, upsertSkill]);

  if (!analysis) return <AnalysisLoading />;

  return (
    <WorkspacePage
      analysisId={analysisId}
      page="Generated Skill"
      title="Generated Agent Skill"
      description=""
      hideTitle
    >
      <SkillWorkspace
        skill={skill}
        loading={loading && !skill}
        error={
          error ??
          (!analysis.apiAnalysis
            ? "This analysis has no live Gemma payload, so a skill cannot be generated."
            : null)
        }
        validation={skill?.validation}
      />
    </WorkspacePage>
  );
}

async function generateSkill(
  analysis: Analysis,
  skillId: string,
  upsertSkill: (skill: SkillRecord) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
) {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch("/api/generate-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis }),
    });
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    const data = (await response.json()) as {
      skillName: string;
      skillContent: string;
      troubleshooting?: string;
      package?: { files: { path: string; content: string }[] };
      validation?: SkillValidation;
    };

    let validation = data.validation;
    const skillContent = data.skillContent;
    const validateResponse = await fetch("/api/validate-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillContent,
        skillName: data.skillName,
      }),
    });
    if (validateResponse.ok) {
      validation = (await validateResponse.json()) as SkillValidation;
    }

    upsertSkill({
      id: skillId,
      name: data.skillName,
      category: inferCategory(analysis.issueCategory),
      description: analysis.summary,
      visibility: "Private",
      updated: "just now",
      validation,
      files:
        data.package?.files?.map((file) => ({
          path: file.path.replace(/^skills\/[^/]+\//, ""),
          content: file.content,
        })) ?? [
          { path: "SKILL.md", content: skillContent },
          {
            path: "references/troubleshooting.md",
            content: data.troubleshooting ?? "",
          },
        ],
    });
  } catch (caught) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Skill generation failed.",
    );
  } finally {
    setLoading(false);
  }
}
