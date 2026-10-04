import {
  Boxes,
  Code2,
  Container,
  Database,
  FileCode2,
  FolderCog,
  LayoutDashboard,
  Server,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IssueCategory } from "@/lib/types";

const config: Record<
  IssueCategory,
  { className: string; icon: typeof Boxes }
> = {
  Frontend: { className: "bg-primary-light text-primary", icon: LayoutDashboard },
  Backend: { className: "bg-error-bg text-error", icon: Server },
  Database: { className: "bg-info-bg text-info", icon: Database },
  DevOps: { className: "bg-info-bg text-info", icon: Boxes },
  Docker: { className: "bg-orange-bg text-orange", icon: Container },
  "Build Tool": { className: "bg-info-bg text-info", icon: Code2 },
  TypeScript: { className: "bg-pink-bg text-pink", icon: FileCode2 },
  Configuration: { className: "bg-muted text-muted-foreground", icon: Settings2 },
  "Module Resolution": {
    className: "bg-primary-light text-primary",
    icon: FolderCog,
  },
};

export function CategoryBadge({
  category,
  withIcon = true,
}: {
  category: IssueCategory;
  withIcon?: boolean;
}) {
  const item = config[category];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        item.className,
      )}
    >
      {withIcon ? <Icon className="size-3.5" /> : null}
      {category}
    </span>
  );
}

export function CategoryIcon({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  const item = config[category];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl",
        item.className,
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}
