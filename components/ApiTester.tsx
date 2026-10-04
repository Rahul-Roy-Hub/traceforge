"use client";

import { useState } from "react";

type AnalysisResult = {
  issueCategory: string;
  summary: string;
  evidence: unknown[];
  likelyCauses: unknown[];
  reproductionSteps: string[];
  fixSteps: string[];
  validationChecklist: string[];
  unknowns: string[];
  meta?: {
    model?: string;
    usedImage?: boolean;
    repaired?: boolean;
    warning?: string;
  };
};

type SkillResult = {
  skillName: string;
  skillContent: string;
  troubleshooting?: string;
  validation?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
};

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function ApiTester() {
  const [image, setImage] = useState<File | null>(null);
  const [userContext, setUserContext] = useState("");
  const [logText, setLogText] = useState("");
  const [projectContext, setProjectContext] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [skill, setSkill] = useState<SkillResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function parseError(response: Response): Promise<string> {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error || `Request failed (${response.status})`;
    } catch {
      return `Request failed (${response.status})`;
    }
  }

  async function analyze() {
    setError(null);
    setSkill(null);
    setValidation(null);
    if (!image) {
      setError("Choose a PNG, JPG, or WebP screenshot.");
      return;
    }
    if (!userContext.trim()) {
      setError("Describe what you were trying to do.");
      return;
    }

    const formData = new FormData();
    formData.set("image", image);
    formData.set("userContext", userContext);
    formData.set("logText", logText);
    formData.set("projectContext", projectContext);

    setLoading("Reading visual evidence...");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const data = (await response.json()) as AnalysisResult;
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(null);
    }
  }

  async function generateSkill() {
    if (!analysis) {
      return;
    }
    setError(null);
    setLoading("Preparing reusable skill...");
    try {
      const { meta: _meta, ...payload } = analysis;
      void _meta;
      const response = await fetch("/api/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: payload }),
      });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const data = (await response.json()) as SkillResult;
      setSkill(data);
      if (data.validation) {
        setValidation(data.validation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skill generation failed.");
    } finally {
      setLoading(null);
    }
  }

  async function validate() {
    if (!skill) {
      return;
    }
    setError(null);
    setLoading("Validating skill...");
    try {
      const response = await fetch("/api/validate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillContent: skill.skillContent,
          skillName: skill.skillName,
        }),
      });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      setValidation((await response.json()) as ValidationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed.");
    } finally {
      setLoading(null);
    }
  }

  async function downloadZip() {
    if (!skill) {
      return;
    }
    setError(null);
    setLoading("Building ZIP...");
    try {
      const response = await fetch("/api/export-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skill.skillName,
          skillContent: skill.skillContent,
          troubleshooting: skill.troubleshooting,
        }),
      });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${skill.skillName}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP export failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">TraceForge</h1>
      <p>Visual Evidence → Diagnosis → Reusable Agent Skill</p>
      <p className="text-sm text-zinc-600">
        Tip: Remove secrets, API keys, passwords, and private tokens before
        uploading screenshots or logs.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Screenshot (PNG / JPG / WebP)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        What were you trying to do?
        <textarea
          className="min-h-24 border p-2"
          value={userContext}
          onChange={(event) => setUserContext(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Error / log (optional)
        <textarea
          className="min-h-24 border p-2 font-mono"
          value={logText}
          onChange={(event) => setLogText(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Project context (optional)
        <textarea
          className="min-h-16 border p-2"
          value={projectContext}
          onChange={(event) => setProjectContext(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button className="border px-3 py-2" type="button" onClick={analyze}>
          Analyze with Gemma 4
        </button>
        <button
          className="border px-3 py-2"
          type="button"
          onClick={generateSkill}
          disabled={!analysis}
        >
          Generate Agent Skill
        </button>
        <button
          className="border px-3 py-2"
          type="button"
          onClick={validate}
          disabled={!skill}
        >
          Validate Skill
        </button>
        <button
          className="border px-3 py-2"
          type="button"
          onClick={downloadZip}
          disabled={!skill}
        >
          Download ZIP
        </button>
      </div>

      {loading ? <p>{loading}</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      {analysis ? (
        <pre className="overflow-auto border p-3 text-xs">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      ) : null}

      {validation ? (
        <p>
          Skill status: {validation.valid ? "VALID" : "INVALID"}
          {validation.errors.length
            ? ` — ${validation.errors.join("; ")}`
            : ""}
        </p>
      ) : null}

      {skill ? (
        <pre className="overflow-auto border p-3 text-xs whitespace-pre-wrap">
          {skill.skillContent}
        </pre>
      ) : null}
    </main>
  );
}
