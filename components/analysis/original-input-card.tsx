"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisRecord } from "@/lib/types";

export function OriginalInputCard({ analysis }: { analysis: AnalysisRecord }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(analysis.description);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-medium">
          Original Input
        </div>
        <div className="rounded-2xl bg-[#1b2030] p-4 text-white shadow-inner">
          <div className="mb-3 flex items-center gap-2 text-xs text-white/60">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2">{analysis.originalInput.source}</span>
            <span>•</span>
            <span>{analysis.originalInput.subtitle}</span>
          </div>
          <div className="rounded-xl bg-[#11151f] p-4 font-mono text-sm">
            <p className="font-semibold text-red-400">✗ {analysis.originalInput.errorLines[0]}</p>
            {analysis.originalInput.errorLines.slice(1).map((line) => (
              <p key={line} className="mt-1 text-red-300">
                {line}
              </p>
            ))}
            {analysis.originalInput.fileRef ? (
              <p className="mt-3 text-white/50">{analysis.originalInput.fileRef}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm italic text-muted-foreground">
          “{analysis.description}”
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Description Provided (Optional)</p>
          <Button variant="ghost" size="sm" onClick={() => setEditing((value) => !value)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>
        {editing ? (
          <Textarea value={value} onChange={(event) => setValue(event.target.value)} />
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
