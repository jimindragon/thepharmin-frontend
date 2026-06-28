"use client";

import clsx from "clsx";
import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/Header";
import { headerNavItemClassName } from "@/components/headerNavStyles";
import { Button, LinkButton } from "@/components/ui/Button";
import { businessCenterHomeItem, businessCenterMenuGroups } from "@/config/businessCenterMenu";
import { sharedRoutes } from "@/config/routes";
import { businessCompanyManager, initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";
import { useBusinessMember } from "@/hooks/useBusinessMember";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

const supportNavItems = [
  { label: "개인 서비스", href: "/" },
  { label: "기업 서비스", href: "/business" },
];

/**
 * 기업회원용 프로필 드롭다운. BusinessAccountMenu(BusinessHeaders.tsx)와 같은 데이터
 * (initialBusinessCompanyProfile, businessCenterMenuGroups)와 드롭다운 패널 구성을 쓰지만,
 * 고객센터 헤더가 개인회원 헤더와 같은 다크 톤이라 트리거 버튼만 AccountMenu와 같은
 * 다크 스타일로 맞춘다.
 */
function SupportBusinessAccountMenu() {
  const pathname = usePathname();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const isHomeActive = pathname === businessCenterHomeItem.href;

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
        <span className="whitespace-nowrap text-[13px] font-medium text-white/88 max-[720px]:hidden">
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
              <Link key={item.href} href={item.href} className={headerNavItemClassName(isActive, "dark")}>
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

          <div className="flex shrink-0 items-center gap-2.5 border-l border-white/15 pl-4 text-white/82 max-[640px]:gap-2 max-[640px]:border-l-0 max-[640px]:pl-0">
            {isLoggedIn ? (
              <>
                <button className="relative grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="알림">
                  <Bell size={20} strokeWidth={2} />
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-[#050505]" />
                </button>
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
