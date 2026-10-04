"use client";

import Link from "next/link";
import { Globe, Lock, MoreHorizontal } from "lucide-react";
import { CategoryIcon } from "@/components/common/category-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SkillRecord } from "@/lib/types";

export function SkillCard({ skill }: { skill: SkillRecord }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon category={skill.category} />
          <div>
            <Link href={`/skills/${skill.id}`} className="font-semibold hover:text-primary">
              {skill.name}
            </Link>
            <p className="text-xs text-muted-foreground">{skill.category}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`${skill.name} actions`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/skills/${skill.id}`}>Open</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mb-5 min-h-10 text-sm text-muted-foreground">{skill.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {skill.updated}</span>
        <Badge variant="outline" className="rounded-full font-medium">
          {skill.visibility === "Public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
          {skill.visibility}
        </Badge>
      </div>
    </article>
  );
}
