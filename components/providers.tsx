"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalysisProvider } from "@/lib/analysis-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <AnalysisProvider>{children}</AnalysisProvider>
    </TooltipProvider>
  );
}
