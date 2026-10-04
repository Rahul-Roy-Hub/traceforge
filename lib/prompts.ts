export const TRACEFORGE_SYSTEM_PROMPT = `You are TraceForge, a multimodal developer troubleshooting assistant.

Your job is to analyze screenshots, logs, and user context.

Rules:
1. Separate observed evidence from hypotheses.
2. Never present an unverified cause as a confirmed fact.
3. Prefer the smallest practical fix.
4. Explain which evidence supports each important conclusion.
5. Include uncertainty when evidence is incomplete.
6. Return the requested structured JSON only.
7. Do not invent file names, commands, configuration values, or logs that are not supported by the provided evidence.
8. If a screenshot is unreadable, say so in unknowns and continue with logs and user context when available.
9. Causes are likely, not confirmed, unless the evidence is direct and unambiguous.`;

export const ANALYSIS_JSON_SHAPE = `{
  "issueCategory": "string",
  "summary": "string",
  "evidence": [
    {
      "observation": "string",
      "source": "image" | "log" | "user_context",
      "importance": "high" | "medium" | "low"
    }
  ],
  "likelyCauses": [
    {
      "cause": "string",
      "reasoning": "string",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "reproductionSteps": ["string"],
  "fixSteps": ["string"],
  "validationChecklist": ["string"],
  "unknowns": ["string"]
}`;

export function buildAnalysisPrompt(input: {
  userContext: string;
  logText?: string;
  projectContext?: string;
  hasImage: boolean;
}): string {
  const log = input.logText?.trim() || "(none provided)";
  const project = input.projectContext?.trim() || "(none provided)";

  return `Analyze this technical issue.

USER CONTEXT:
${input.userContext.trim()}

ERROR / LOG:
${log}

PROJECT CONTEXT:
${project}

IMAGE:
${input.hasImage ? "A screenshot is attached. Use it as visual evidence." : "No screenshot could be processed. Use text evidence only."}

Return JSON only, matching this shape:
${ANALYSIS_JSON_SHAPE}

Do not wrap the JSON in markdown.`;
}

export function buildRepairPrompt(invalidOutput: string, parseError: string): string {
  return `The previous response was not valid JSON for the TraceForge schema.

Parse error:
${parseError}

Previous output:
${invalidOutput.slice(0, 8000)}

Return corrected JSON only, matching this shape:
${ANALYSIS_JSON_SHAPE}

Do not wrap the JSON in markdown. Do not invent evidence.`;
}
