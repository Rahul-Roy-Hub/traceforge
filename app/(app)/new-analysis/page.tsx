import { Suspense } from "react";
import { NewAnalysisPage } from "@/components/new-analysis/new-analysis-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <NewAnalysisPage />
    </Suspense>
  );
}
