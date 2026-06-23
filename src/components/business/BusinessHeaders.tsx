"use client";

import clsx from "clsx";
import { Bell, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";

const publicNavItems = [
  { label: "요금제", href: "/business/pricing" },
  { label: "헤드헌팅 의뢰", href: "/business/headhunting" },
  { label: "고객센터", href: "/business/support" },
];

const centerNavItems = [
  { label: "대시보드", href: "/business/dashboard" },
  { label: "채용관리", href: "/business/jobs" },
  { label: "기업 프로필", href: "/business/company/profile" },
  { label: "헤드헌팅 관리", href: "/business/headhunting/manage" },
  { label: "인재풀", href: "/business/applicants" },
  { label: "결제·이용권", href: "/business/billing/plans" },
  { label: "고객센터", href: "/business/support/inquiries" },
];

function BusinessBrand({ homeHref }: { homeHref: string }) {
  return (
    <Link href={homeHref} className="flex shrink-0 items-center gap-3" aria-label="더파마 리크루트 기업 서비스 홈">
      <img
        src="/images/logo_biz.svg"
        alt="더파마 리크루트"
        width={284}
        height={28}
        className="h-[28px] w-[284px] object-contain max-[900px]:h-[25px] max-[900px]:w-[254px] max-[560px]:h-[22px] max-[560px]:w-[224px]"
      />
      <span className="h-5 w-px bg-[#d7dde5]" aria-hidden="true" />
      <span className="whitespace-nowrap text-[13px] font-medium text-[#68717e] max-[420px]:text-[12px]">기업</span>
    </Link>
  );
}

export function BusinessPublicHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#dfe4ea] bg-white text-[#17202c]">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <BusinessBrand homeHref="/business" />
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-8 text-[14px] max-[1120px]:hidden">
          {publicNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap transition",
                  active
                    ? "relative font-semibold text-[#111111] after:absolute after:-bottom-[22px] after:left-0 after:h-[3px] after:w-full after:bg-[#111111]"
                    : "font-medium text-[#4f5967] hover:text-[#111111]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2.5 max-[520px]:gap-1.5">
          <Link href="/business/login" className="hidden h-10 items-center px-3 text-[12px] font-medium text-[#4f5967] hover:text-[#111111] sm:inline-flex">
            로그인
          </Link>
          <Link href="/business/signup" className="hidden h-10 items-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111] md:inline-flex">
            기업 계정 신청
          </Link>
          <LinkButton href="/business/login" variant="gradient" size="sm" className="max-[520px]:hidden">
            공고 등록하기
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

export function BusinessCenterHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#dfe4ea] bg-white text-[#17202c]">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <BusinessBrand homeHref="/business/dashboard" />
        <nav className="flex min-w-0 flex-1 items-center gap-5 text-[14px] max-[1180px]:hidden">
          {centerNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap transition",
                  active
                    ? "relative font-semibold text-[#111111] after:absolute after:-bottom-[22px] after:left-0 after:h-[3px] after:w-full after:bg-[#111111]"
                    : "font-medium text-[#4f5967] hover:text-[#111111]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2.5 max-[520px]:gap-1.5">
          <button type="button" className="relative grid h-9 w-9 place-items-center text-[#303946] hover:bg-[#f4f5f6]" aria-label="알림">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 bg-danger ring-2 ring-white" />
          </button>
          <button type="button" className="flex h-10 items-center gap-2 border border-[#d7dde5] px-2.5 text-[12px] font-medium text-[#303946] hover:border-[#111111] max-[640px]:hidden">
            <span className="grid h-6 w-6 place-items-center bg-[#f0f2f4] text-[11px]">더</span>
            <span className="hidden whitespace-nowrap md:inline">더파마뉴스</span>
            <ChevronDown size={14} className="text-[#7d8796]" />
          </button>
          <LinkButton href="/business/jobs/new" variant="gradient" size="sm">
            <Plus size={15} />
            <span className="max-[520px]:sr-only">공고 등록</span>
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
