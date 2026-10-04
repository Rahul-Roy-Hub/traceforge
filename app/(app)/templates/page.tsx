import { CategoryIcon } from "@/components/common/category-badge";
import { PageHeader } from "@/components/layout/page-header";
import { templates } from "@/lib/mock-data";

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Templates"
        description="Start from a known failure pattern instead of a blank analysis."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <CategoryIcon category={template.category} />
              <div>
                <h2 className="font-semibold">{template.name}</h2>
                <p className="text-xs text-muted-foreground">{template.category}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
