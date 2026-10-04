import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AnalysisHeader({
  crumbs,
}: {
  crumbs: { href?: string; label: string }[];
}) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {crumbs.flatMap((crumb, index) => {
          const item = (
            <BreadcrumbItem key={crumb.label}>
              {crumb.href && index < crumbs.length - 1 ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
          if (index === 0) return [item];
          return [
            <BreadcrumbSeparator key={`${crumb.label}-sep`} />,
            item,
          ];
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
