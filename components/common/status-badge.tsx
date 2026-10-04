import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisStatus } from "@/lib/types";

const styles: Record<
  AnalysisStatus,
  { className: string; icon: typeof CheckCircle2; label: string }
> = {
  Completed: {
    className: "bg-success-bg text-success",
    icon: CheckCircle2,
    label: "Completed",
  },
  "In Progress": {
    className: "bg-warning-bg text-warning",
    icon: Clock3,
    label: "In Progress",
  },
  Failed: {
    className: "bg-error-bg text-error",
    icon: AlertCircle,
    label: "Failed",
  },
};

export function StatusBadge({ status }: { status: AnalysisStatus }) {
  const config = styles[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
