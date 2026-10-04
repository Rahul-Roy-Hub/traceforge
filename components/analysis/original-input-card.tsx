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
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-medium">
          Original Input
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl bg-[#1b2030] p-4 text-white shadow-inner">
          <div className="mb-3 flex min-w-0 items-start gap-2 text-xs text-white/60">
            <span className="mt-1 flex shrink-0 items-center gap-1" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <div className="min-w-0 flex-1">
              <p>{analysis.originalInput.source}</p>
              <p className="break-all">{analysis.originalInput.subtitle}</p>
            </div>
          </div>
          <div className="max-h-80 min-w-0 overflow-auto rounded-xl bg-[#11151f] p-4 font-mono text-[13px] leading-5">
            {analysis.originalInput.errorLines.map((line, index) => (
              <p
                key={`${index}-${line.slice(0, 40)}`}
                className={`break-all whitespace-pre-wrap ${index === 0 ? "font-semibold text-red-400" : "mt-1.5 text-red-300"}`}
              >
                {index === 0 ? `✗ ${line}` : line}
              </p>
            ))}
            {analysis.originalInput.fileRef ? (
              <p className="mt-3 break-all text-white/50">{analysis.originalInput.fileRef}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 break-words text-sm italic text-muted-foreground">
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
          <p className="break-words text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
