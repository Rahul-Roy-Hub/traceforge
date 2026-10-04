"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Play,
  Sparkles,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "diagnosis", label: "Diagnosis", icon: FileText },
  { href: "reproduction", label: "Reproduction", icon: Play },
  { href: "fix-plan", label: "Fix Plan", icon: Wrench },
  { href: "validation", label: "Validation", icon: CheckCircle2 },
  { href: "references", label: "References", icon: BookOpen },
  { href: "generated-skill", label: "Generated Skill", icon: Sparkles },
];

export function AnalysisTabs({ analysisId }: { analysisId: string }) {
  const pathname = usePathname();
  const base = `/analysis/${analysisId}`;

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const href = `${base}/${tab.href}`;
        const active = pathname === href;
        const highlighted = tab.href === "generated-skill";
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-primary/20 bg-primary-light font-medium text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
              highlighted && !active && "border-primary/30 text-primary",
              highlighted && active && "shadow-sm",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
