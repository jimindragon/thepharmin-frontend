"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { SidebarHelpCard } from "@/components/ui/SidebarHelpCard";
import { myPageMenuGroups, myPageUser } from "@/config/myPageMenu";

function SidebarLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        // ≤1040px에서는 그룹이 해체되고 링크가 nav의 직계 flex 아이템(칩)이 된다 —
        // h-10으로 터치 타깃 40px을 확보하고, 줄바꿈·수축을 막아 가로 스크롤 한 행을 유지한다.
        "flex items-center justify-between gap-3 border px-3 py-2.5 text-[14px] font-medium transition",
        "max-[1040px]:h-10 max-[1040px]:shrink-0 max-[1040px]:whitespace-nowrap max-[1040px]:py-0",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-transparent text-[#4f5967] hover:border-[#dfe4ea] hover:bg-[#f7f8fa] hover:text-[#111111]",
      )}
    >
      <span>{label}</span>
    </Link>
  );
}

export function MyPageSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <aside className="border-r border-border bg-white px-6 py-7 max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5 max-[1040px]:py-4">
      <div>
        {/* 이메일·태그 칩은 ≤1040px에서 숨긴다 — 모바일 첫 화면은 본문(카드) 밀도가 우선이고,
            둘 다 회원정보 화면이 정본이다. mt는 숨는 요소 쪽에 있어 함께 사라진다. */}
        <p className="text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">{myPageUser.name} 님</p>
        <p className="mt-1 text-[13px] font-normal text-[#8a94a3] max-[1040px]:hidden">{myPageUser.email}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 max-[1040px]:hidden">
          {myPageUser.tags.map((tag) => (
            <span key={tag} className="inline-flex h-6 items-center border border-[#e5e9ef] bg-[#f7f8fa] px-2 text-[11px] font-medium text-[#596373]">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 h-px bg-[#e5e9ef] max-[1040px]:mt-3" />
      {/* ≤1040px: 그룹 3개(제목 + 세로 링크)의 2차원 구조를 CSS만으로 해체해 링크 11개를
          한 행 가로 스크롤 칩으로 만든다. 래퍼 두 겹에 display:contents를 걸어 상자를
          투명화하면 링크가 nav의 직계 flex 아이템이 되므로, 마크업과 데이터 소스는 그대로 둔다.
          contents는 상자만 없앨 뿐 자식은 그대로라 space-y-1의 margin-top은 살아남는다 — 함께 끈다. */}
      <nav className="mt-5 space-y-7 max-[1040px]:mt-3 max-[1040px]:flex max-[1040px]:items-center max-[1040px]:gap-2 max-[1040px]:space-y-0 max-[1040px]:overflow-x-auto max-[1040px]:pb-2">
        {myPageMenuGroups.map((group) => (
          <div key={group.title} className="max-[1040px]:contents">
            <p className="text-[17px] font-bold text-[#222a35] max-[1040px]:hidden">{group.title}</p>
            <div className="mt-2 space-y-1 max-[1040px]:contents max-[1040px]:space-y-0">
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
