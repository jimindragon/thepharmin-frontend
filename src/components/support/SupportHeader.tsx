"use client";

import clsx from "clsx";
import { ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountMenu } from "@/components/Header";
import { headerDropdownActionClassName, headerNavItemClassName } from "@/components/headerNavStyles";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button, LinkButton } from "@/components/ui/Button";
import { businessAccountMenuItems } from "@/config/businessAccountMenu";
import { businessCenterHomeItem, isApprovalGatedPath } from "@/config/businessCenterMenu";
import { sharedRoutes } from "@/config/routes";
import { initialIndustryOrgManager, initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";
import { MOCK_BUSINESS_NOTIFICATIONS, MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { clearBusinessMember, useBusinessMember } from "@/hooks/useBusinessMember";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { useOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

const supportNavItems = [
  { label: "개인 서비스", href: "/" },
  { label: "기업 서비스", href: "/business" },
];

/** BusinessHeaders·BusinessCenterShell의 잠금 툴팁과 같은 문구 */
const LOCK_TITLE = "기업 인증 후 이용할 수 있습니다";

/**
 * 기업회원용 프로필 드롭다운. BusinessAccountMenu(BusinessHeaders.tsx)와 같은 데이터
 * (initialBusinessCompanyProfile, businessCenterMenuGroups)와 드롭다운 패널 구성을 쓰지만,
 * 고객센터 헤더가 개인회원 헤더와 같은 다크 톤이라 트리거 버튼만 AccountMenu와 같은
 * 다크 스타일로 맞춘다.
 */
function SupportBusinessAccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const orgVerificationStatus = useOrgVerificationStatus();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const isHomeActive = pathname === businessCenterHomeItem.href;

  // BusinessAccountMenu의 로그아웃과 같은 동작 — 저장소를 비우고 기업 소개로 보낸다.
  const handleLogout = () => {
    clearBusinessMember();
    setOpen(false);
    router.push("/business");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 py-1 pl-1 pr-1.5 hover:bg-white/10 max-[520px]:gap-1.5 max-[520px]:pr-1.5"
      >
        <span className="grid h-[30px] w-[30px] place-items-center border border-white/20 bg-[#222222] text-[14px] font-medium text-white">
          {initialBusinessCompanyProfile.displayName.slice(0, 1)}
        </span>
        <span className="whitespace-nowrap text-[13px] font-medium text-white/90 max-[720px]:hidden">
          {initialBusinessCompanyProfile.displayName}
        </span>
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.58)"
          className={clsx("transition-transform max-[520px]:hidden", open && "rotate-180")}
        />
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
            {/* 항목·순서·잠금 표시·구분선 구성 모두 BusinessAccountMenu와 동일하다
                (businessAccountMenuItems 공유 + 같은 isApprovalGatedPath 판정).
                대시보드를 같은 블록에 둬 5항목을 등간격으로 유지하는 것까지 동일. */}
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
          {/* 로그아웃 — BusinessAccountMenu와 같은 위치·구분선·시각 스펙. */}
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
 * 고객센터는 개인회원·기업회원이 함께 보는 중립 페이지라, 둘 중 하나라도
 * 로그인된 상태면 로그인 화면으로 본다. 두 상태가 동시에 true인 경우(데모에서
 * 기업 로그인까지 거친 뒤 고객센터로 돌아온 경우)는 명시적으로 로그인한
 * 기업 계정 쪽을 우선 표시한다 — 개인회원 상태는 기본값이 항상 true인 목업이라
 * 신뢰도가 더 낮다.
 */
export function SupportHeader() {
  const pathname = usePathname();
  const { isLoggedIn: isPersonalLoggedIn, login } = usePersonalLoginState();
  const isBusinessMember = useBusinessMember();
  const isLoggedIn = isPersonalLoggedIn || isBusinessMember;

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <a href="/" className="flex shrink-0 items-center" aria-label="THE PHARMA Recruit. 홈으로 이동">
          <img
            src="/images/white_logo_1.svg"
            alt="THE PHARMA Recruit."
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </a>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-6 whitespace-nowrap text-[14px] max-[860px]:hidden">
          {supportNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={headerNavItemClassName(isActive)}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <LinkButton
            href={`${sharedRoutes.support}/contact`}
            variant="gradient"
            tone="dark"
            size="sm"
            className="shrink-0 max-[860px]:hidden"
          >
            1:1 문의하기
          </LinkButton>

          <div className="flex shrink-0 items-center gap-2.5 border-l border-white/15 pl-4 text-white/80 max-[640px]:gap-2 max-[640px]:border-l-0 max-[640px]:pl-0">
            {isLoggedIn ? (
              <>
                <NotificationBell
                  notifications={isBusinessMember ? MOCK_BUSINESS_NOTIFICATIONS : MOCK_PERSONAL_NOTIFICATIONS}
                  viewAllHref={isBusinessMember ? "/business/notifications" : "/mypage/notifications"}
                  scope={isBusinessMember ? "business" : "personal"}
                />
                {isBusinessMember ? <SupportBusinessAccountMenu /> : <AccountMenu />}
              </>
            ) : (
              <Button type="button" variant="secondary" tone="dark" size="sm" onClick={() => login()}>
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
