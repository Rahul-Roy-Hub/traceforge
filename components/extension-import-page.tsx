"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAnalysisStore } from "@/lib/analysis-store";
import { parseAnalysisResponse } from "@/lib/api";
import { inferCategory, mapApiToAnalysis } from "@/lib/map-analysis";
import type { SkillRecord, SkillValidation } from "@/lib/types";

const STORAGE_KEY = "traceforge.extension-import";

type ExtensionImportPayload = {
  id?: string;
  analysis?: unknown;
  capture?: {
    url?: string;
    title?: string;
    selectedText?: string;
    console?: { message?: string }[];
    network?: { method?: string; status?: number; url?: string }[];
  };
  skill?: {
    skillName?: string;
    skillContent?: string;
    troubleshooting?: string;
    package?: { files?: { path: string; content: string }[] };
    validation?: SkillValidation;
  };
  open?: "analysis" | "skill";
};

function decodeHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function readPayload(): ExtensionImportPayload | null {
  const fromHash = decodeHash(window.location.hash);
  const raw = fromHash || sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as ExtensionImportPayload)
      : null;
  } catch {
    return null;
  }
}

function isStaticAsset(url = "") {
  return /\.(?:woff2?|ttf|otf|eot|png|jpe?g|gif|svg|ico|webp|css|map)(?:[?#]|$)/i.test(
    url,
  );
}

function collectErrorLines(capture: NonNullable<ExtensionImportPayload["capture"]>) {
  const consoleLines = (capture.console || [])
    .map((item) => item.message || "")
    .map((line) => line.trim())
    .filter(Boolean);
  const networkLines = (capture.network || [])
    .filter((item) => !isStaticAsset(item.url || ""))
    .map((item) =>
      `${item.method || "GET"} ${item.status || ""} ${item.url || ""}`.trim(),
    )
    .filter(Boolean);
  return [...consoleLines, ...networkLines].slice(0, 8);
}

export function ExtensionImportPage() {
  const router = useRouter();
  const { upsertAnalysis, upsertSkill, ready } = useAnalysisStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    const started = Date.now();
    const timer = window.setInterval(() => {
      const payload = readPayload();
      if (!payload) {
        if (Date.now() - started > 2500) {
          window.clearInterval(timer);
          setError(
            "No analysis was passed from the TraceForge extension. Go back to the popup and click View Full Analysis again.",
          );
        }
        return;
      }

      window.clearInterval(timer);
      try {
        const analysis = parseAnalysisResponse(payload.analysis);
        const id = payload.id || `analysis-${Date.now()}`;
        const capture = payload.capture || {};
        const errorLines = collectErrorLines(capture);

        upsertAnalysis(
          mapApiToAnalysis(analysis, {
            id,
            description: [
              capture.title,
              capture.url,
              capture.selectedText,
            ]
              .filter(Boolean)
              .join("\n"),
            originalInput: {
              source: "Chrome extension capture",
              subtitle: capture.url || capture.title || "Captured page",
              errorLines: errorLines.length ? errorLines : [analysis.summary],
            },
          }),
        );

        if (payload.skill?.skillName && payload.skill.skillContent) {
          const skill: SkillRecord = {
            id,
            name: payload.skill.skillName,
            category: inferCategory(analysis.issueCategory),
            description: analysis.summary,
            visibility: "Private",
            updated: "just now",
            validation: payload.skill.validation,
            files:
              payload.skill.package?.files?.map((file) => ({
                path: file.path.replace(/^skills\/[^/]+\//, ""),
                content: file.content,
              })) ?? [
                { path: "SKILL.md", content: payload.skill.skillContent },
                {
                  path: "references/troubleshooting.md",
                  content: payload.skill.troubleshooting ?? "",
                },
              ],
          };
          upsertSkill(skill);
        }

        sessionStorage.removeItem(STORAGE_KEY);
        if (window.location.hash) {
          history.replaceState(null, "", window.location.pathname);
        }

        if (payload.open === "skill") {
          router.replace(`/skills/${id}`);
        } else {
          router.replace(`/analysis/${id}`);
        }
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not open the captured analysis.",
        );
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [ready, router, upsertAnalysis, upsertSkill]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <Sparkles className="size-8 animate-pulse text-primary" />
      <p className="font-medium">
        {error ? "Could not open analysis" : "Opening your TraceForge analysis..."}
      </p>
      {error ? (
        <p className="max-w-md text-sm text-error">{error}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Importing the diagnosis from the Chrome extension.
        </p>
      )}
    </div>
  );
}
