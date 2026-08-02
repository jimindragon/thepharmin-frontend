"use client";

import clsx from "clsx";
import { ChevronDown, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { headerDropdownActionClassName } from "@/components/headerNavStyles";
import { LinkButton } from "@/components/ui/Button";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { businessAccountMenuItems } from "@/config/businessAccountMenu";
import { businessCenterHomeItem, isApprovalGatedPath } from "@/config/businessCenterMenu";
import { initialIndustryOrgManager, initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";
import { MOCK_BUSINESS_NOTIFICATIONS } from "@/data/notifications";
import { clearBusinessMember, useBusinessMember } from "@/hooks/useBusinessMember";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { useOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";

const LOCK_TITLE = "기업 인증 후 이용할 수 있습니다";

// 기업센터는 BusinessAccountMenu 드롭다운 안에 이미 있어 중복을 피함.
// 헤드헌팅 의뢰는 우측 아웃라인 버튼으로 승격.
//
// requiresLogin — 로그인해야 실제로 쓸 수 있는 항목. 비로그인에게는 렌더하지 않는다.
// 눌러도 BusinessCenterShell의 로그인 안내판만 나오는 메뉴를 보여 주는 것은 길이 아니라 벽이다.
// 조건을 마크업에 흩뿌리지 않고 여기 한 곳에 적어 두는 이유 — 항목이 늘 때 nav JSX를 다시 읽지 않아도 된다.
const businessNavItems = [
  { label: "상품안내", href: "/business#pricing", requiresLogin: false },
  { label: "대시보드", href: "/business/dashboard", requiresLogin: true },
  { label: "기업관리", href: "/business/profile-hub", requiresLogin: true },
];

function lightNavItemClassName(active: boolean) {
  return clsx(
    "whitespace-nowrap transition text-[14px]",
    active ? "font-medium text-[#303946]" : "font-normal text-[#8a94a3] hover:text-[#303946]",
  );
}

function BusinessBrand({ homeHref }: { homeHref: string }) {
  return (
    // shrink-0 대신 min-w-0 — 좁은 폭에서 로고가 우측 버튼 그룹을 파고들지 않고 함께 줄어든다.
    <Link href={homeHref} aria-label="기업 센터 홈으로 이동" className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity">
      <img
        src="/images/color_logo_1.svg"
        alt="더파마 리크루트"
        width={284}
        height={28}
        className="h-[28px] w-[284px] object-contain max-[900px]:h-[25px] max-[900px]:w-[254px] max-[560px]:h-[22px] max-[560px]:w-[224px]"
      />
      {/* 960px 이하에서는 우측 버튼 그룹(505px)과 자리를 다투므로 로고만 남긴다.
          로고 이미지 자체에 "THE PHARMA Recruit" 워드마크가 들어 있어 식별에 문제없다. */}
      <span className="h-[16px] w-px shrink-0 bg-[#c8ced8] max-[960px]:hidden" aria-hidden="true" />
      <span className="whitespace-nowrap text-[13px] font-bold text-[#111111] max-[960px]:hidden max-[420px]:text-[11px]">
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
  const router = useRouter();
  const orgVerificationStatus = useOrgVerificationStatus();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const isHomeActive = pathname === businessCenterHomeItem.href;

  // 로그인 화면(/business/login)이 아니라 기업 소개(/business)로 보낸다 —
  // 나가려는 사람에게 곧바로 다시 들어오라고 요구하지 않기 위해서.
  const handleLogout = () => {
    clearBusinessMember();
    setOpen(false);
    router.push("/business");
  };

  return (
    // 좁은 폭에서 숨기지 않고 트리거만 줄인다 — 개인 Header·SupportHeader와 같은 기준(이름 720, 화살표 520).
    // 숨기면 사이드바 없는 화면(/business·pricing·headhunting·company/preview)에서 기업센터 진입로가 사라진다.
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        // 아바타가 aria-hidden이고 사명은 720px 이하에서 숨으므로, 버튼 이름은 여기서만 나온다.
        // 개인 헤더와 달리 법인명이라 "님"을 붙이지 않는다.
        aria-label={`${initialBusinessCompanyProfile.displayName} 계정 메뉴`}
        className="flex h-10 items-center gap-2 border border-[#d7dde5] px-2.5 text-[12px] font-medium text-[#303946] hover:border-[#111111] max-[520px]:gap-0 max-[520px]:px-1.5"
      >
        <EntityLogo
          name={initialBusinessCompanyProfile.displayName}
          logoUrl={initialBusinessCompanyProfile.logoUrl ?? undefined}
          size={24}
        />
        <span className="whitespace-nowrap max-[720px]:hidden">{initialBusinessCompanyProfile.displayName}</span>
        <ChevronDown size={14} className={clsx("text-[#7d8796] transition-transform max-[520px]:hidden", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 w-[260px] border border-border bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-[14px] font-bold text-[#17202c]">{initialBusinessCompanyProfile.displayName}</p>
            <p className="mt-0.5 text-[13px] font-normal text-[#8a94a3]">
              {initialIndustryOrgManager.department} · {initialIndustryOrgManager.position}
            </p>
          </div>
          <div className="h-px bg-[#edf1f5]" />
          <div className="py-2">
            {/* 대시보드도 나머지 4항목과 한 블록에 둔다 — 구분선을 지운 뒤에도 블록을 나눠 두면
                py-1.5 두 겹이 12px 여백으로 남아 첫 행만 유독 떨어져 보인다. 5항목 모두 등간격. */}
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
              {businessAccountMenuItems.map((item) => {
                const active = pathname === item.href;
                const locked = orgVerificationStatus === "pending" && isApprovalGatedPath(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "flex items-center justify-between gap-2 px-2 py-2 text-[13px] font-medium transition-colors",
                      active ? "font-bold text-[#111111]" : "text-[#4f5967] hover:text-[#111111]",
                    )}
                  >
                    <span>{item.label}</span>
                    {locked ? (
                      <span title={LOCK_TITLE} aria-label={LOCK_TITLE} className="shrink-0">
                        <Lock size={14} className="text-[#9aa3af]" aria-hidden="true" />
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* 로그아웃 — 이동이 아니라 상태를 끊는 동작이라 위 항목들과 구분선으로 갈라 둔다.
              색은 나머지와 동일하게(경고색 없음): 되돌릴 수 있는 평범한 동작이다. */}
          <div className="border-t border-border px-1 py-1.5">
            <button type="button" onClick={handleLogout} className={headerDropdownActionClassName}>
              로그아웃
            </button>
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

  // 로그인 화면 자기 자신에서는 redirect를 붙이지 않는다 — 개인 헤더(Header.tsx)와 같은 규칙.
  const loginHref =
    pathname === "/business/login" ? "/business/login" : `/business/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-border bg-white text-[#17202c]">
      {/* gap-4 — 좁은 폭에서 로고가 우측 버튼 그룹에 맞닿지 않도록 최소 간격을 보장한다. */}
      <div className="app-shell flex h-full items-center justify-between gap-4">
        {/* 좌측: 로고 | 기업 센터 | 요금제 · 고객센터 */}
        <div className="flex min-w-0 items-center gap-5">
          <BusinessBrand homeHref="/business" />
          {/* 우측 버튼 그룹이 505px라 1121~1279px 구간은 nav를 감당하지 못하고 겹친다.
              1280px부터만 노출하되, 그 1280px도 gap-7(28px)이면 1.2px 겹치므로 gap-6(24px)을 쓴다. */}
          <nav className="flex items-center gap-6 max-[1279px]:hidden">
            {businessNavItems
              .filter((item) => isMember || !item.requiresLogin)
              .map((item) => (
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
                {/* 520까지 유지 — 760에서 헤드헌팅 의뢰(103px)가 빠져 자리가 생기는데 같은 브레이크포인트에
                    묶여 함께 사라지면서 641~760 구간에 기업→개인 전환 경로가 없어졌었다. */}
                <Link
                  href="/"
                  className="whitespace-nowrap rounded-full border border-[#d4dae3] px-3 py-1 text-[13px] font-medium text-[#b0bac7] transition-colors hover:border-[#b0bac7] hover:text-[#4f5967] max-[520px]:hidden"
                >
                  개인 서비스
                </Link>
                <NotificationBell
                  notifications={MOCK_BUSINESS_NOTIFICATIONS}
                  viewAllHref="/business/notifications"
                  scope="business"
                  tone="light"
                />
                <BusinessAccountMenu />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* 로그인은 이 헤더의 유일한 진입로라 어느 폭에서도 숨기지 않는다.
                  계정 신청만 이 파일의 최협 브레이크포인트(520)에서 접는다 — 개인 헤더와 같은 규칙. */}
              <Link href={loginHref} className="inline-flex h-10 items-center px-3 text-[12px] font-medium text-[#4f5967] hover:text-[#111111]">
                로그인
              </Link>
              <Link
                href="/business/signup"
                className="hidden h-10 items-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111] min-[521px]:inline-flex"
              >
                기업 계정 신청
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
