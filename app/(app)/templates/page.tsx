import Link from "next/link";
import { CategoryIcon } from "@/components/common/category-badge";
import { PageHeader } from "@/components/layout/page-header";
import { demoTemplates } from "@/lib/demo-examples";

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Templates"
        description="Start from a known failure pattern. These only prefill New Analysis — Gemma 4 still runs on your screenshot."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {demoTemplates.map((template) => (
          <Link
            key={template.id}
            href={`/new-analysis?example=${template.id}`}
            className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-3">
              <CategoryIcon category={template.category} />
              <div>
                <h2 className="font-semibold">{template.name}</h2>
                <p className="text-xs text-muted-foreground">{template.category}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
