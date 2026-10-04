"use client";

import { useMemo, useState } from "react";
import { ChevronRight, FileCode2, Folder } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SkillFile } from "@/lib/types";

type TreeNode = {
  name: string;
  path: string;
  children?: TreeNode[];
  file?: SkillFile;
};

function buildTree(files: SkillFile[], rootName: string): TreeNode {
  const root: TreeNode = { name: rootName, path: "", children: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join("/");
      const isFile = index === parts.length - 1;
      current.children ??= [];
      let next = current.children.find((child) => child.name === part);
      if (!next) {
        next = { name: part, path, children: isFile ? undefined : [], file: isFile ? file : undefined };
        current.children.push(next);
      }
      current = next;
    });
  }
  return root;
}

function NodeView({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string;
  onSelect: (file: SkillFile) => void;
}) {
  const [open, setOpen] = useState(true);
  const isDir = Boolean(node.children);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (node.file) onSelect(node.file);
          else setOpen((value) => !value);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
          node.file && node.path === selected ? "bg-primary-light text-primary" : "hover:bg-muted",
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        {isDir ? (
          <ChevronRight className={cn("size-3.5 text-muted-foreground transition", open && "rotate-90")} />
        ) : (
          <span className="w-3.5" />
        )}
        {isDir ? <Folder className="size-4 text-muted-foreground" /> : <FileCode2 className="size-4 text-primary" />}
        <span className="truncate">{node.name}{isDir ? "/" : ""}</span>
      </button>
      {isDir && open
        ? node.children?.map((child) => (
            <NodeView
              key={child.path}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}

export function SkillFileTree({
  rootName,
  files,
  selected,
  onSelect,
}: {
  rootName: string;
  files: SkillFile[];
  selected: string;
  onSelect: (file: SkillFile) => void;
}) {
  const tree = useMemo(() => buildTree(files, rootName), [files, rootName]);
  return (
    <ScrollArea className="h-[520px] rounded-2xl border border-border bg-card p-3">
      <NodeView node={tree} depth={0} selected={selected} onSelect={onSelect} />
    </ScrollArea>
  );
}
