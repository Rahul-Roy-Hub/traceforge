"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SkillCodeViewer({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = content.replace(/\n$/, "").split("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-editor text-editor-foreground">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="inline-flex min-w-0 items-center gap-2 truncate text-sm text-white/80">
          <FileText className="size-4" />
          {filename}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={copy}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              const blob = new Blob([content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
          >
            Raw
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[470px]">
        <pre className="p-4 font-mono text-[13px] leading-6">
          {lines.map((line, index) => (
            <div key={`${index}-${line.slice(0, 12)}`} className="flex gap-4">
              <span className="w-6 shrink-0 select-none text-right text-white/30">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">{line || " "}</span>
            </div>
          ))}
        </pre>
      </ScrollArea>
    </div>
  );
}
