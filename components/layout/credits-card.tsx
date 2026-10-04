import { Sparkles } from "lucide-react";
import Link from "next/link";

export function CreditsCard() {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3 transition-colors hover:bg-primary-light/60"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
        <Sparkles className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          Gemma 4
        </span>
        <span className="block text-xs text-muted-foreground">
          Gemini API · set GEMINI_API_KEY
        </span>
      </span>
      <span className="text-muted-foreground">›</span>
    </Link>
  );
}
