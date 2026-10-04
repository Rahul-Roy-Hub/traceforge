import { readFileSync } from "node:fs";
import path from "node:path";
import { generateSkillPackage } from "./skill-generator";
import { validateSkill } from "./skill-validator";
import type { Analysis } from "./schemas";

export type HarnessFixture = {
  id: string;
  title: string;
  skillName: string;
  expectedConcepts: string[];
  analysis: Analysis;
};

export const HARNESS_FIXTURES: HarnessFixture[] = [
  {
    id: "module-resolution",
    title: "Module resolution error",
    skillName: "debug-module-resolution",
    expectedConcepts: [
      "inspect import",
      "path alias",
      "file path",
      "run the production build",
      "filename casing",
    ],
    analysis: {
      issueCategory: "module-resolution",
      summary:
        "Module resolution failure during production build after a component move.",
      evidence: [
        {
          observation: "Unresolved import @components/Button appears in the screenshot.",
          source: "image",
          importance: "high",
        },
        {
          observation: "Failure occurs during GitHub Actions production build.",
          source: "log",
          importance: "high",
        },
        {
          observation: "User reports a recent Button component move.",
          source: "user_context",
          importance: "medium",
        },
      ],
      likelyCauses: [
        {
          cause: "Import path no longer matches file location.",
          reasoning: "The component moved while the import stayed the same.",
          confidence: "high",
        },
        {
          cause: "TypeScript path alias may be misconfigured.",
          reasoning: "The import uses @components which depends on tsconfig paths.",
          confidence: "medium",
        },
      ],
      reproductionSteps: [
        "Move the Button component.",
        "Keep the old import.",
        "Run the production build.",
      ],
      fixSteps: [
        "Verify the file exists at the expected path.",
        "Check tsconfig path aliases.",
        "Verify filename and import casing.",
        "Update the import.",
      ],
      validationChecklist: ["Run the production build.", "Run relevant tests."],
      unknowns: ["The actual current file path was not provided."],
    },
  },
  {
    id: "ci-deploy",
    title: "CI/CD deployment error",
    skillName: "debug-deployment",
    expectedConcepts: [
      "inspect the failed job",
      "environment variable",
      "build log",
      "redeploy",
    ],
    analysis: {
      issueCategory: "deployment",
      summary:
        "Production deploy failed in CI after a configuration or secret mismatch.",
      evidence: [
        {
          observation: "The screenshot shows a failed Deploy Production GitHub Action.",
          source: "image",
          importance: "high",
        },
        {
          observation: "The log contains a missing environment or build command error.",
          source: "log",
          importance: "high",
        },
      ],
      likelyCauses: [
        {
          cause: "Required environment variable is missing in the deploy job.",
          reasoning: "CI failed during the production deploy step.",
          confidence: "medium",
        },
      ],
      reproductionSteps: [
        "Trigger the production workflow.",
        "Inspect the failed job and build log.",
      ],
      fixSteps: [
        "Compare local and CI environment variables.",
        "Fix the deploy command or secret mapping.",
        "Redeploy.",
      ],
      validationChecklist: ["The deploy job succeeds.", "The production URL responds."],
      unknowns: ["Exact secret names were not provided."],
    },
  },
  {
    id: "ui-api",
    title: "UI/API connection problem",
    skillName: "analyze-ui-error",
    expectedConcepts: [
      "network request",
      "cors",
      "api url",
      "browser console",
    ],
    analysis: {
      issueCategory: "ui-error",
      summary:
        "The UI cannot reach the API, shown as a failed browser request or console error.",
      evidence: [
        {
          observation: "The screenshot shows a failed network request in the browser.",
          source: "image",
          importance: "high",
        },
        {
          observation: "The console or proxy log shows a connection or CORS failure.",
          source: "log",
          importance: "high",
        },
      ],
      likelyCauses: [
        {
          cause: "The client is calling the wrong API URL.",
          reasoning: "The UI error appears while the API may still be healthy.",
          confidence: "medium",
        },
        {
          cause: "CORS is blocking the browser request.",
          reasoning: "Browser-only failures often come from missing CORS headers.",
          confidence: "medium",
        },
      ],
      reproductionSteps: [
        "Open the UI.",
        "Trigger the failing request.",
        "Inspect the browser console and network tab.",
      ],
      fixSteps: [
        "Confirm the API URL.",
        "Check CORS on the API.",
        "Retry the request.",
      ],
      validationChecklist: [
        "The network request succeeds.",
        "The UI renders the expected data.",
      ],
      unknowns: ["The API server configuration was not provided."],
    },
  },
];

export type HarnessCaseResult = {
  id: string;
  title: string;
  skillName: string;
  passed: boolean;
  coverage: number;
  matchedConcepts: string[];
  missingConcepts: string[];
  validationValid: boolean;
};

export type HarnessResult = {
  testCases: number;
  passed: number;
  failed: number;
  coverage: number;
  cases: HarnessCaseResult[];
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[_-]+/g, " ");
}

function conceptCoverage(skillContent: string, expectedConcepts: string[]) {
  const haystack = normalize(skillContent);
  const matchedConcepts: string[] = [];
  const missingConcepts: string[] = [];

  for (const concept of expectedConcepts) {
    const tokens = normalize(concept).split(/\s+/).filter(Boolean);
    const hit = tokens.every((token) => haystack.includes(token));
    if (hit) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }

  const coverage =
    expectedConcepts.length === 0
      ? 1
      : matchedConcepts.length / expectedConcepts.length;

  return { matchedConcepts, missingConcepts, coverage };
}

function loadExampleSkill(skillName: string): string | null {
  const skillPath = path.join(process.cwd(), "skills", skillName, "SKILL.md");
  try {
    return readFileSync(skillPath, "utf8");
  } catch {
    return null;
  }
}

export function runHarness(input?: {
  skillContent?: string;
  skillName?: string;
}): HarnessResult {
  let providedName = input?.skillName;
  if (input?.skillContent && !providedName) {
    providedName = validateSkill(input.skillContent).metadata?.name;
  }

  const cases: HarnessCaseResult[] = HARNESS_FIXTURES.map((fixture) => {
    const generated = generateSkillPackage(fixture.analysis);
    const skillContent =
      input?.skillContent && providedName === fixture.skillName
        ? input.skillContent
        : loadExampleSkill(fixture.skillName) ?? generated.skillContent;

    const validation = validateSkill(skillContent, fixture.skillName);
    const concepts = conceptCoverage(skillContent, fixture.expectedConcepts);
    const passed = validation.valid && concepts.coverage >= 0.7;

    return {
      id: fixture.id,
      title: fixture.title,
      skillName: fixture.skillName,
      passed,
      coverage: concepts.coverage,
      matchedConcepts: concepts.matchedConcepts,
      missingConcepts: concepts.missingConcepts,
      validationValid: validation.valid,
    };
  });

  const passed = cases.filter((item) => item.passed).length;
  const coverage =
    cases.reduce((sum, item) => sum + item.coverage, 0) / Math.max(cases.length, 1);

  return {
    testCases: cases.length,
    passed,
    failed: cases.length - passed,
    coverage: Math.round(coverage * 100),
    cases,
  };
}
