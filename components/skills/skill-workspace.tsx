"use client";

import { useMemo, useState } from "react";
import JSZip from "jszip";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SkillCodeViewer } from "@/components/skills/skill-code-viewer";
import { SkillFileTree } from "@/components/skills/skill-file-tree";
import type { SkillRecord } from "@/lib/types";

export function SkillWorkspace({
  skill,
  heading = "Generated Agent Skill",
  description = "A reusable skill that can be used by other agents to solve similar problems.",
}: {
  skill: SkillRecord;
  heading?: string;
  description?: string;
}) {
  const [selected, setSelected] = useState(skill.files[0]);
  const current = useMemo(
    () => skill.files.find((file) => file.path === selected.path) ?? skill.files[0],
    [skill.files, selected.path],
  );

  async function downloadZip() {
    const live = skill.files.find((file) => file.path === "SKILL.md");
    if (live) {
      try {
        const response = await fetch("/api/export-skill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillName: skill.name,
            skillContent: live.content,
            troubleshooting: skill.files.find((file) => file.path.includes("troubleshooting"))?.content,
          }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `${skill.name}.zip`;
          anchor.click();
          URL.revokeObjectURL(url);
          return;
        }
      } catch {
        // Fall through to client ZIP.
      }
    }

    const zip = new JSZip();
    const folder = zip.folder(skill.name);
    skill.files.forEach((file) => folder?.file(file.path, file.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${skill.name}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title={heading}
        description={description}
        actions={
          <Button onClick={downloadZip} variant="outline" className="rounded-xl">
            <Download className="size-4" />
            Download ZIP
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SkillFileTree
          rootName={skill.name}
          files={skill.files}
          selected={current.path}
          onSelect={setSelected}
        />
        <SkillCodeViewer filename={current.path.split("/").at(-1) ?? current.path} content={current.content} />
      </div>
    </div>
  );
}
