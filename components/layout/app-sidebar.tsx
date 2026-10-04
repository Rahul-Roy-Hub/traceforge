"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock3,
  FilePlus2,
  LayoutTemplate,
  Settings,
} from "lucide-react";
import { TraceForgeLogo } from "@/components/brand/traceforge-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreditsCard } from "@/components/layout/credits-card";

const items = [
  { href: "/new-analysis", label: "New Analysis", icon: FilePlus2 },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/skills", label: "Skills", icon: BookOpen },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="px-4 py-5">
        <Link href="/" className="flex items-center" aria-label="TraceForge home">
          <TraceForgeLogo className="h-12" priority />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-11 rounded-xl px-3 text-[15px] data-active:bg-primary-light data-active:font-medium data-active:text-primary"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <CreditsCard />
      </SidebarFooter>
    </Sidebar>
  );
}
