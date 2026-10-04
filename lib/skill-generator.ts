import yaml from "js-yaml";
import {
  SKILL_DESCRIPTION_MAX,
  SKILL_NAME_MAX,
  SKILL_NAME_PATTERN,
} from "./constants";
import type { Analysis } from "./schemas";

export type SkillPackage = {
  skillName: string;
  skillContent: string;
  troubleshooting: string;
  files: { path: string; content: string }[];
};

function toKebab(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateSkillName(issueCategory: string): string {
  const kebab = toKebab(issueCategory);
  const base =
    kebab.startsWith("debug-") || kebab.startsWith("analyze-")
      ? kebab
      : `debug-${kebab || "issue"}`;

  let name = base.slice(0, SKILL_NAME_MAX).replace(/-+$/g, "");
  if (!SKILL_NAME_PATTERN.test(name)) {
    name = "debug-issue";
  }
  return name;
}

function clip(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function list(items: string[], empty = "- Not specified in the source analysis."): string {
  if (!items.length) {
    return empty;
  }
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export function generateSkillPackage(analysis: Analysis): SkillPackage {
  const skillName = generateSkillName(analysis.issueCategory);
  const description = clip(
    `${analysis.summary} Use this skill when diagnosing ${analysis.issueCategory.toLowerCase()} from screenshots, logs, and developer context.`,
    SKILL_DESCRIPTION_MAX,
  );

  const evidenceRules = analysis.evidence.length
    ? analysis.evidence
        .map(
          (item) =>
            `- Observed (${item.source}, ${item.importance}): ${item.observation}`,
        )
        .join("\n")
    : "- Prefer direct evidence from logs or screenshots.";

  const causes = analysis.likelyCauses.length
    ? analysis.likelyCauses
        .map(
          (item) =>
            `- Likely (${item.confidence}): ${item.cause} — ${item.reasoning}`,
        )
        .join("\n")
    : "- Treat causes as hypotheses until evidence confirms them.";

  const frontmatter = yaml
    .dump(
      {
        name: skillName,
        description,
        license: "Apache-2.0",
      },
      { lineWidth: 80 },
    )
    .trim();

  const skillContent = `---
${frontmatter}
---

# ${skillName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")}

## Purpose

${analysis.summary}

Use this skill for ${analysis.issueCategory.toLowerCase()} issues when a developer provides a screenshot, error log, or short description of what they were trying to do.

## Workflow

${list(
  [
    "Inspect the screenshot and extract visible error text, UI state, and environment clues.",
    "Read the supplied logs and correlate them with the visual evidence.",
    "Separate observed facts from hypotheses.",
    ...analysis.reproductionSteps,
    ...analysis.fixSteps,
  ].slice(0, 12),
)}

## Evidence Rules

- Prefer direct evidence from logs or screenshots.
- Distinguish observed facts from hypotheses.
- Do not claim that a cause is confirmed unless evidence supports it.
- Do not invent file names, commands, configuration values, or logs.

${evidenceRules}

Likely causes from the source incident:

${causes}

Unknowns from the source incident:

${list(analysis.unknowns, "- None recorded.")}

## Validation

${list(
  analysis.validationChecklist.length
    ? analysis.validationChecklist
    : [
        "The original error no longer appears.",
        "The relevant build, test, or request succeeds.",
      ],
)}
`;

  const troubleshooting = `# Troubleshooting ${skillName}

## Summary

${analysis.summary}

## Evidence

${evidenceRules}

## Likely causes

${causes}

## Unknowns

${list(analysis.unknowns, "- None recorded.")}
`;

  return {
    skillName,
    skillContent,
    troubleshooting,
    files: [
      { path: `skills/${skillName}/SKILL.md`, content: skillContent },
      {
        path: `skills/${skillName}/references/troubleshooting.md`,
        content: troubleshooting,
      },
    ],
  };
}
