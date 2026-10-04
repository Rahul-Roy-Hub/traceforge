"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SkillCodeViewer } from "@/components/skills/skill-code-viewer";
import { SkillFileTree } from "@/components/skills/skill-file-tree";
import { readApiError } from "@/lib/api";
import type { SkillRecord, SkillValidation } from "@/lib/types";

export function SkillWorkspace({
  skill,
  heading = "Generated Agent Skill",
  description = "A reusable skill that can be used by other agents to solve similar problems.",
  loading = false,
  error = null,
  validation,
}: {
  skill?: SkillRecord | null;
  heading?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  validation?: SkillValidation;
}) {
  const files = useMemo(() => skill?.files ?? [], [skill?.files]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const current = files.find((file) => file.path === selectedPath) ?? files[0];

  async function downloadZip() {
    if (!skill) return;
    setZipError(null);
    const live = skill.files.find((file) => file.path === "SKILL.md") ?? skill.files[0];
    if (!live) return;
    try {
      const response = await fetch("/api/export-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skill.name,
          skillContent: live.content,
          troubleshooting: skill.files.find((file) =>
            file.path.includes("troubleshooting"),
          )?.content,
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${skill.name}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setZipError(
        caught instanceof Error ? caught.message : "ZIP export failed.",
      );
    }
  }

  const status = validation ?? skill?.validation;

  return (
    <div>
      <PageHeader
        title={heading}
        description={description}
        actions={
          <Button
            onClick={() => void downloadZip()}
            variant="outline"
            className="rounded-xl"
            disabled={!skill?.files.length}
          >
            <Download className="size-4" />
            Download ZIP
          </Button>
        }
      />
      {status ? (
        <p className="mb-4 text-sm">
          Skill status: {status.valid ? "VALID" : "INVALID"}
          {status.errors.length ? ` — ${status.errors.join("; ")}` : ""}
          {status.warnings.length ? ` (${status.warnings.join("; ")})` : ""}
        </p>
      ) : null}
      {zipError ? <p className="mb-4 text-sm text-error">{zipError}</p> : null}
      {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Generating Agent Skill...</p>
      ) : null}
      {!loading && !skill?.files.length && !error ? (
        <p className="text-sm text-muted-foreground">
          No generated skill yet. Open this tab after a live analysis.
        </p>
      ) : null}
      {current ? (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <SkillFileTree
            rootName={skill?.name ?? "skill"}
            files={files}
            selected={current.path}
            onSelect={(file) => setSelectedPath(file.path)}
          />
          <SkillCodeViewer
            filename={current.path.split("/").at(-1) ?? current.path}
            content={current.content}
          />
        </div>
      ) : null}
    </div>
  );
}
