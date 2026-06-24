"use client";

import clsx from "clsx";
import { Bell, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerNavItemClassName } from "@/components/headerNavStyles";
import { LinkButton } from "@/components/ui/Button";
import { sharedRoutes } from "@/config/routes";
import { useBusinessMember } from "@/hooks/useBusinessMember";

/**
 * 기업센터 내부 페이지(로그인 필요 영역) 경로 목록.
 * 좌측 사이드바(BusinessSidebar)가 다루는 영역과 동일한 기준으로,
 * 헤더의 `기업센터` 메뉴 활성 상태를 판단할 때 사용한다.
 */
const businessCenterPathPrefixes = [
  "/business/dashboard",
  "/business/jobs",
  "/business/applicants",
  "/business/company",
  "/business/billing",
  "/business/headhunting/manage",
];

function isBusinessCenterPath(pathname: string) {
  return businessCenterPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const businessNavItems = [
  { label: "요금제", href: "/business/pricing" },
  { label: "헤드헌팅 의뢰", href: "/business/headhunting" },
  { label: "고객센터", href: sharedRoutes.support },
];

function navLinkClassName(active: boolean) {
  return clsx("whitespace-nowrap transition", headerNavItemClassName(active, "light"));
}

function BusinessBrand({ homeHref }: { homeHref: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Link href="/" aria-label="더파마 리크루트 개인회원 홈으로 이동">
        <img
          src="/images/logo_biz.svg"
          alt="더파마 리크루트"
          width={284}
          height={28}
          className="h-[28px] w-[284px] object-contain max-[900px]:h-[25px] max-[900px]:w-[254px] max-[560px]:h-[22px] max-[560px]:w-[224px]"
        />
      </Link>
      <span className="h-5 w-px bg-[#d7dde5]" aria-hidden="true" />
      <Link href={homeHref} className="whitespace-nowrap text-[13px] font-medium text-[#68717e] hover:text-[#111111] max-[420px]:text-[12px]">
        기업 센터
      </Link>
    </div>
  );
}

/**
 * 기업 영역 공용 헤더. 로그인 여부와 관계없이 동일한 메뉴 구성·디자인을 유지하고,
 * 우측 계정 영역과 `기업센터` 메뉴의 목적지만 인증 상태(useBusinessMember)에 따라 분기한다.
 */
export function BusinessHeader() {
  const pathname = usePathname();
  const isMember = useBusinessMember();
  const centerHref = isMember ? "/business/dashboard" : "/business/login?redirect=/business/dashboard";
  const centerActive = isBusinessCenterPath(pathname);

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#dfe4ea] bg-white text-[#17202c]">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <BusinessBrand homeHref={isMember ? "/business/dashboard" : "/business"} />
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-8 text-[14px] max-[1120px]:hidden">
          {businessNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClassName(pathname === item.href)}>
              {item.label}
            </Link>
          ))}
          <Link href={centerHref} className={navLinkClassName(centerActive)}>
            기업센터
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2.5 max-[520px]:gap-1.5">
          {isMember ? (
            <>
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
            </>
          ) : (
            <>
              <Link href="/business/login" className="hidden h-10 items-center px-3 text-[12px] font-medium text-[#4f5967] hover:text-[#111111] sm:inline-flex">
                로그인
              </Link>
              <Link href="/business/signup" className="hidden h-10 items-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111] md:inline-flex">
                기업 계정 신청
              </Link>
              <LinkButton href="/business/login" variant="gradient" size="sm" className="max-[520px]:hidden">
                공고 등록하기
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
