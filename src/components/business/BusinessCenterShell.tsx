"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { SidebarHelpCard } from "@/components/ui/SidebarHelpCard";
import { businessCenterHomeItem, businessCenterMenuGroups } from "@/config/businessCenterMenu";
import { markBusinessMember } from "@/hooks/useBusinessMember";

function SidebarLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "block border px-3 py-2.5 text-[13px] font-bold transition",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-transparent text-[#4f5967] hover:border-[#dfe4ea] hover:bg-[#f7f8fa] hover:text-[#111111]",
      )}
    >
      {label}
    </Link>
  );
}

export function BusinessSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <aside className="border-r border-[#dfe4ea] bg-white px-6 py-7 max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5">
      <h2 className="text-[22px] font-black tracking-[0] text-[#17202c]">기업 센터</h2>
      <div className="mt-5 h-px bg-[#e5e9ef]" />
      <nav className="mt-5 space-y-7 max-[1040px]:flex max-[1040px]:gap-6 max-[1040px]:space-y-0 max-[1040px]:overflow-x-auto max-[1040px]:pb-2">
        <div className="max-[1040px]:min-w-[148px]">
          <SidebarLink {...businessCenterHomeItem} active={isActive(businessCenterHomeItem.href)} />
        </div>
        {businessCenterMenuGroups.map((group) => (
          <div key={group.title} className="max-[1040px]:min-w-[148px]">
            <p className="text-[12px] font-black text-[#222a35]">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <SidebarLink key={item.href} {...item} active={isActive(item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <SidebarHelpCard />
    </aside>
  );
}

export function BusinessCenterShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    markBusinessMember();
  }, []);

  return (
    <>
      <BusinessHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <div className="app-shell grid grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
          <BusinessSidebar />
          <div className="min-w-0 py-8 pl-8 max-[1040px]:px-4 max-[760px]:py-6">{children}</div>
        </div>
      </main>
    </>
  );
}
