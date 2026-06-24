"use client";

import clsx from "clsx";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { myPageMenuGroups, myPageUser } from "@/config/myPageMenu";
import { sharedRoutes } from "@/config/routes";

function SidebarLink({ label, href, badge, active }: { label: string; href: string; badge?: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-between gap-3 border px-3 py-2.5 text-[13px] font-bold transition",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-transparent text-[#4f5967] hover:border-[#dfe4ea] hover:bg-[#f7f8fa] hover:text-[#111111]",
      )}
    >
      <span>{label}</span>
      {badge ? <span className={clsx("text-[12px] font-normal", active ? "text-white/65" : "text-[#a0a9b7]")}>{badge}</span> : null}
    </Link>
  );
}

export function MyPageSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <aside className="border-r border-[#dfe4ea] bg-white px-6 py-7 max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5">
      <div>
        <p className="text-[16px] font-bold tracking-[-0.01em] text-[#17202c]">{myPageUser.name} 님</p>
        <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">{myPageUser.email}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {myPageUser.tags.map((tag) => (
            <span key={tag} className="inline-flex h-6 items-center border border-[#e5e9ef] bg-[#f7f8fa] px-2 text-[11px] font-medium text-[#596373]">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 h-px bg-[#e5e9ef]" />
      <nav className="mt-5 space-y-7 max-[1040px]:flex max-[1040px]:gap-6 max-[1040px]:space-y-0 max-[1040px]:overflow-x-auto max-[1040px]:pb-2">
        {myPageMenuGroups.map((group) => (
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
      <div className="mt-8 border border-[#dfe4ea] bg-[#fbfcfd] p-4 max-[1040px]:hidden">
        <div className="flex items-center gap-2 text-[13px] font-black text-[#2c3440]">
          <HelpCircle size={17} />
          도움이 필요하신가요?
        </div>
        <p className="mt-2 text-[12px] font-semibold leading-[1.7] text-[#7b8491]">고객센터를 통해 빠르게 도와드리겠습니다.</p>
        <Link href={sharedRoutes.support} className="mt-4 inline-flex h-9 items-center border border-[#d2dae4] bg-white px-4 text-[12px] font-black text-[#3c4654] hover:border-[#111111]">
          고객센터
        </Link>
      </div>
    </aside>
  );
}

export function MyPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <div className="sidebar-shell grid grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
          <MyPageSidebar />
          <div className="min-w-0 px-8 py-8 max-[760px]:px-4 max-[760px]:py-6">{children}</div>
        </div>
      </main>
    </>
  );
}
