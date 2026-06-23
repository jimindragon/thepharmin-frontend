"use client";

import clsx from "clsx";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BusinessCenterHeader } from "@/components/business/BusinessHeaders";
import { markBusinessMember } from "@/hooks/useBusinessMember";

const sidebarGroups = [
  {
    title: "기업센터",
    items: [{ label: "대시보드", href: "/business/dashboard" }],
  },
  {
    title: "채용관리",
    items: [
      { label: "공고 등록", href: "/business/jobs/new" },
      { label: "공고 관리", href: "/business/jobs" },
      { label: "지원자 관리", href: "/business/applicants" },
      { label: "헤드헌팅 관리", href: "/business/headhunting/manage" },
    ],
  },
  {
    title: "기업 관리",
    items: [
      { label: "기업정보 관리", href: "/business/company/profile" },
      { label: "브랜드 페이지 미리보기", href: "/business/company/preview" },
    ],
  },
  {
    title: "요금제/결제",
    items: [
      { label: "요금제 관리", href: "/business/billing/plans" },
      { label: "결제 내역", href: "/business/billing/history" },
    ],
  },
  {
    title: "문의/지원",
    items: [{ label: "1:1 문의", href: "/business/support/inquiries" }],
  },
];

export function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r border-[#dfe4ea] bg-white px-6 py-7 max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5">
      <h2 className="text-[22px] font-black tracking-[0] text-[#17202c]">기업 센터</h2>
      <div className="mt-5 h-px bg-[#e5e9ef]" />
      <nav className="mt-5 space-y-7 max-[1040px]:flex max-[1040px]:gap-6 max-[1040px]:space-y-0 max-[1040px]:overflow-x-auto max-[1040px]:pb-2">
        {sidebarGroups.map((group) => (
          <div key={group.title} className="max-[1040px]:min-w-[148px]">
            <p className="text-[12px] font-black text-[#222a35]">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "block border px-3 py-2.5 text-[13px] font-bold transition",
                      active
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-transparent text-[#4f5967] hover:border-[#dfe4ea] hover:bg-[#f7f8fa] hover:text-[#111111]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-8 border border-[#dfe4ea] bg-[#fbfcfd] p-4 max-[1040px]:hidden">
        <div className="flex items-center gap-2 text-[13px] font-black text-[#2c3440]">
          <HelpCircle size={17} />
          도움이 필요하신가요?
        </div>
        <p className="mt-2 text-[12px] font-semibold leading-[1.7] text-[#7b8491]">1:1 문의를 통해 빠르게 도와드리겠습니다.</p>
        <Link href="/business/support/inquiries" className="mt-4 inline-flex h-9 items-center border border-[#d2dae4] bg-white px-4 text-[12px] font-black text-[#3c4654] hover:border-[#111111]">
          문의하기
        </Link>
      </div>
    </aside>
  );
}

export function BusinessCenterShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    markBusinessMember();
  }, []);

  return (
    <>
      <BusinessCenterHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <div className="mx-auto grid w-[min(1440px,100vw)] grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
          <BusinessSidebar />
          <div className="min-w-0 px-8 py-8 max-[760px]:px-4 max-[760px]:py-6">{children}</div>
        </div>
      </main>
    </>
  );
}
