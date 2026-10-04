import type { Analysis } from "@/lib/schemas";
import type { AnalysisRecord } from "@/lib/types";

export function mapApiToAnalysis(
  analysis: Analysis,
  extras: {
    id: string;
    description: string;
    originalInput?: AnalysisRecord["originalInput"];
    imagePreview?: string;
  },
): AnalysisRecord {
  const topCause = analysis.likelyCauses[0];
  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const issueType = inferCategory(analysis.issueCategory);

  return {
    id: extras.id,
    title: analysis.summary.slice(0, 72),
    issueType,
    status: "Completed",
    date,
    time,
    error: analysis.summary,
    description: extras.description,
    confidence: (topCause?.confidence === "high"
      ? "High"
      : topCause?.confidence === "low"
        ? "Low"
        : "Medium") as AnalysisRecord["confidence"],
    issueDetected: analysis.summary,
    whatIsHappening:
      analysis.evidence[0]?.observation ?? analysis.summary,
    likelyCause: topCause?.cause ?? "Needs more evidence to confirm a root cause.",
    whyLikely:
      topCause?.reasoning ??
      "The diagnosis is based on the screenshot, log, and description you provided.",
    additionalContext:
      analysis.unknowns.length > 0
        ? `Unknowns to keep in mind: ${analysis.unknowns.join(" ")}`
        : "Cross-check bundler aliases, tsconfig paths, and recent file moves before applying the fix.",
    evidence: analysis.evidence.map((item) => item.observation),
    reproductionSteps: analysis.reproductionSteps,
    suggestedFix: analysis.fixSteps[0] ?? "Review the suggested fix plan for detailed steps.",
    validationChecklist: analysis.validationChecklist,
    references: [
      {
        title: "Project configuration",
        detail: "Compare tsconfig, bundler aliases, and import paths.",
      },
      {
        title: "Framework docs",
        detail: "Check official path alias and module resolution guidance.",
      },
    ],
    fixSteps: analysis.fixSteps.map((step, index) => ({
      title: `Step ${index + 1}`,
      description: step,
      filename: "Terminal",
      language: "bash",
      code: step,
    })),
    originalInput: extras.originalInput ?? {
      source: extras.imagePreview ? "Uploaded screenshot" : "Error log",
      subtitle: extras.description,
      errorLines: [analysis.summary],
    },
    skillId: extras.id,
    apiAnalysis: analysis,
  };
}

function inferCategory(value: string): AnalysisRecord["issueType"] {
  const lower = value.toLowerCase();
  if (lower.includes("module") || lower.includes("resolv") || lower.includes("import")) {
    return "Module Resolution";
  }
  if (lower.includes("docker")) return "Docker";
  if (lower.includes("type")) return "TypeScript";
  if (lower.includes("postgres") || lower.includes("database") || lower.includes("sql")) {
    return "Database";
  }
  if (lower.includes("api") || lower.includes("500") || lower.includes("server")) {
    return "Backend";
  }
  if (lower.includes("vite") || lower.includes("webpack") || lower.includes("build")) {
    return "Build Tool";
  }
  if (lower.includes("env") || lower.includes("config")) return "Configuration";
  if (lower.includes("ui") || lower.includes("react") || lower.includes("front")) {
    return "Frontend";
  }
  if (lower.includes("ci") || lower.includes("deploy") || lower.includes("devops")) {
    return "DevOps";
  }
  return "Module Resolution";
}
