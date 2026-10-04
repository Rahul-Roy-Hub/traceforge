"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SkillGrid } from "@/components/skills/skill-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAnalysisStore } from "@/lib/analysis-store";
import type { IssueCategory } from "@/lib/types";

const categories: Array<"all" | IssueCategory> = [
  "all",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Docker",
  "Build Tool",
  "TypeScript",
  "Configuration",
  "Module Resolution",
];

export function SkillsPage() {
  const { skills, upsertSkill } = useAnalysisStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [sort, setSort] = useState("recent");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const filtered = useMemo(() => {
    const list = skills.filter((skill) => {
      const matchesQuery = `${skill.name} ${skill.description} ${skill.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "all" || skill.category === category;
      return matchesQuery && matchesCategory;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.updated.localeCompare(b.updated);
      return 0;
    });
  }, [skills, query, category, sort]);

  return (
    <div>
      <PageHeader
        title="My Skills"
        description="Reusable Agent Skills generated from your analyses."
      />
      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills by name, description or tag..."
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value as (typeof categories)[number])}>
          <SelectTrigger className="h-11 rounded-xl lg:w-40">
            <SelectValue placeholder="All skills" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All skills" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-11 rounded-xl lg:w-48">
            <SelectValue placeholder="Recently updated" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Button className="h-11 rounded-xl" onClick={() => setOpen(true)}>
          <Plus />
          New Skill
        </Button>
      </div>
      <SkillGrid skills={filtered} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a skill</DialogTitle>
          </DialogHeader>
          <Input placeholder="skill-name" value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea
            placeholder="What should this skill help with?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Button
            onClick={() => {
              const id = name.trim() || `custom-skill-${Date.now()}`;
              upsertSkill({
                id,
                name: id,
                category: "Frontend",
                description: description || "Custom skill created in TraceForge.",
                visibility: "Private",
                updated: "just now",
                files: [{ path: "SKILL.md", content: `# ${id}\n\n${description}\n` }],
              });
              setOpen(false);
              setName("");
              setDescription("");
            }}
          >
            Create skill
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
