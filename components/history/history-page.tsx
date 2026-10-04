"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, MoreHorizontal, Search } from "lucide-react";
import { CategoryBadge } from "@/components/common/category-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalysisStore } from "@/lib/analysis-store";

export function HistoryPage() {
  const router = useRouter();
  const { analyses } = useAnalysisStore();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("all");

  const rows = useMemo(() => {
    return analyses.filter((item) => {
      const haystack = `${item.title} ${item.error} ${item.description} ${item.issueType}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
      if (range === "week") return item.date.includes("Oct");
      if (range === "month") return item.date.includes("Sep") || item.date.includes("Oct");
      return true;
    });
  }, [analyses, query, range]);

  return (
    <div>
      <PageHeader
        title="History"
        description="View your past analyses and generated skills."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search analyses by title, error, or description..."
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-40">
            <CalendarRange className="size-4" />
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="week">Past week</SelectItem>
            <SelectItem value="month">Past month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="px-4 py-3">Input</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => router.push(`/analysis/${item.id}`)}
              >
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="hidden size-14 overflow-hidden rounded-lg bg-editor p-2 font-mono text-[8px] leading-3 text-white/80 sm:block">
                      {item.error.slice(0, 42)}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={item.issueType} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div>{item.date}</div>
                  <div>{item.time}</div>
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Row actions">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/analysis/${item.id}`)}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
