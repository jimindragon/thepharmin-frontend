"use client";

import clsx from "clsx";
import { Bell, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { businessCenterHomeItem, businessCenterMenuGroups } from "@/config/businessCenterMenu";
import { businessCompanyManager, initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";
import { useBusinessMember } from "@/hooks/useBusinessMember";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";

// 가운데 nav: 요금제 · 고객센터만 유지.
// 기업센터는 BusinessAccountMenu 드롭다운 안에 이미 있어 중복을 피함.
// 헤드헌팅 의뢰는 우측 아웃라인 버튼으로 승격.
const businessNavItems = [
  { label: "상품안내", href: "/business#pricing" },
  { label: "대시보드", href: "/business/dashboard" },
  { label: "기업관리", href: "/business/company/profile" },
];

function lightNavItemClassName(active: boolean) {
  return clsx(
    "whitespace-nowrap transition text-[13px]",
    active ? "font-medium text-[#303946]" : "font-normal text-[#8a94a3] hover:text-[#303946]",
  );
}

function BusinessBrand({ homeHref }: { homeHref: string }) {
  return (
    <Link href={homeHref} aria-label="기업 센터 홈으로 이동" className="flex shrink-0 items-center gap-3 hover:opacity-80 transition-opacity">
      <img
        src="/images/color_logo_1.svg"
        alt="더파마 리크루트"
        width={284}
        height={28}
        className="h-[28px] w-[284px] object-contain max-[900px]:h-[25px] max-[900px]:w-[254px] max-[560px]:h-[22px] max-[560px]:w-[224px]"
      />
      <span className="h-[16px] w-px shrink-0 bg-[#c8ced8]" aria-hidden="true" />
      <span className="whitespace-nowrap text-[13px] font-bold text-[#111111] max-[420px]:text-[11px]">
        기업 센터
      </span>
    </Link>
  );
}

/**
 * 헤더 우측의 기업 프로필(더파마뉴스) 드롭다운. 개인회원 AccountMenu(Header.tsx)와
 * 동일한 인터랙션(useDropdownMenu)을 쓰되, 메뉴 내용은 기업센터 사이드바 구성
 * (businessCenterMenuGroups)을 그대로 가져와 둘이 항상 같은 목적지를 가리키게 한다.
 */
export function BusinessAccountMenu() {
  const pathname = usePathname();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const isHomeActive = pathname === businessCenterHomeItem.href;

  return (
    <div ref={containerRef} className="relative max-[640px]:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 border border-[#d7dde5] px-2.5 text-[12px] font-medium text-[#303946] hover:border-[#111111]"
      >
        <span className="grid h-6 w-6 place-items-center bg-[#f0f2f4] text-[11px]">더</span>
        <span className="hidden whitespace-nowrap md:inline">더파마뉴스</span>
        <ChevronDown size={14} className={clsx("text-[#7d8796] transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 w-[260px] border border-[#e5e9ef] bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-[14px] font-bold text-[#17202c]">{initialBusinessCompanyProfile.displayName}</p>
            <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">
              {businessCompanyManager.department} · {businessCompanyManager.position}
            </p>
          </div>
          <div className="h-px bg-[#edf1f5]" />
          <div className="py-2">
            <div className="px-1 py-1.5">
              <Link
                href={businessCenterHomeItem.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center px-2 py-2 text-[13px] font-medium transition-colors",
                  isHomeActive ? "font-bold text-[#111111]" : "text-[#4f5967] hover:text-[#111111]",
                )}
              >
                {businessCenterHomeItem.label}
              </Link>
            </div>
            {businessCenterMenuGroups.map((group) => (
              <div key={group.title} className="px-1 py-1.5">
                <p className="px-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#a0a9b7]">{group.title}</p>
                <div className="mt-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={clsx(
                          "flex items-center px-2 py-2 text-[13px] font-medium transition-colors",
                          active ? "font-bold text-[#111111]" : "text-[#4f5967] hover:text-[#111111]",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="h-px bg-[#edf1f5]" />
          <div className="px-1 py-1.5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center px-2 py-2 text-[13px] font-medium text-[#a0a9b7] transition-colors hover:text-[#4f5967]"
            >
              개인 홈으로 전환
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * 기업 영역 공용 헤더.
 *
 * 우측 행동 영역 위계 (로그인 상태 기준):
 *   [헤드헌팅 의뢰 — 아웃라인] [공고 등록 — 그라데이션 솔리드] [알림] [프로필 드롭다운]
 */
export function BusinessHeader() {
  const pathname = usePathname();
  const isMember = useBusinessMember();

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#dfe4ea] bg-white text-[#17202c]">
      <div className="app-shell flex h-full items-center justify-between">
        {/* 좌측: 로고 | 기업 센터 | 요금제 · 고객센터 */}
        <div className="flex min-w-0 items-center gap-5">
          <BusinessBrand homeHref="/business" />
          <nav className="flex items-center gap-7 max-[1120px]:hidden">
            {businessNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={lightNavItemClassName(pathname === item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 우측: 버튼 그룹 + 아이콘 그룹 */}
        <div className="flex shrink-0 items-center gap-4 max-[520px]:gap-2">
          {isMember ? (
            <>
              {/* 버튼 그룹 */}
              <div className="flex items-center gap-2.5">
                {/* 2순위 — 아웃라인 버튼, 760px 미만에서 숨김 */}
                <LinkButton href="/business/headhunting" variant="secondary" size="sm" className="max-[760px]:hidden border-[#d4d4d4] text-[#555555]">
                  헤드헌팅 의뢰
                </LinkButton>
                {/* 1순위 — 브랜드 그라데이션 솔리드 버튼 */}
                <LinkButton href="/business/jobs/new" variant="gradient" size="sm">
                  <Plus size={15} />
                  <span className="max-[520px]:sr-only">공고 등록</span>
                </LinkButton>
              </div>
              {/* 아이콘 그룹 */}
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2 text-[12px] font-medium text-[#b0bac7] transition-colors hover:text-[#4f5967] max-[760px]:hidden"
                >
                  개인 서비스
                </Link>
                <button type="button" className="relative grid h-9 w-9 place-items-center text-[#303946] hover:bg-[#f4f5f6]" aria-label="알림">
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2 w-2 bg-danger ring-2 ring-white" />
                </button>
                <BusinessAccountMenu />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Link href="/business/login" className="hidden h-10 items-center px-3 text-[12px] font-medium text-[#4f5967] hover:text-[#111111] sm:inline-flex">
                  로그인
                </Link>
                <Link href="/business/signup" className="hidden h-10 items-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111] md:inline-flex">
                  기업 계정 신청
                </Link>
              </div>
              <div className="flex items-center gap-2.5">
                {/* 2순위 — 아웃라인 버튼, 760px 미만에서 숨김 */}
                <LinkButton href="/business/headhunting" variant="secondary" size="sm" className="max-[760px]:hidden">
                  헤드헌팅 의뢰
                </LinkButton>
                {/* 1순위 — 브랜드 그라데이션 솔리드 버튼 */}
                <LinkButton href="/business/login" variant="gradient" size="sm" className="max-[520px]:hidden">
                  공고 등록하기
                </LinkButton>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
