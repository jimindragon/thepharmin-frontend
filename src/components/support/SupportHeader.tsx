"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/Header";
import { headerNavItemClassName } from "@/components/headerNavStyles";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { LinkButton } from "@/components/ui/Button";
import { sharedRoutes } from "@/config/routes";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

const supportNavItems = [
  { label: "개인 서비스", href: "/" },
  { label: "기업 서비스", href: "/business" },
];

/**
 * 화면은 경로로 판단한다 — /business/* 는 기업 세션만, 그 밖은 개인 세션만 본다.
 * 고객센터는 후자라 개인 세션 하나만 보고, 두 상태를 조합해 우선순위를 따지지 않는다.
 * 기업 계정으로만 로그인한 사용자에게 이 헤더가 비로그인으로 보이는 것은 그 규칙의 결과다.
 */
export function SupportHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = usePersonalLoginState();

  // 개인 헤더(Header.tsx)와 같은 규칙으로 돌아올 경로를 넘긴다.
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="THE PHARMA Recruit. 홈으로 이동">
          <img
            src="/images/white_logo_1.svg"
            alt="THE PHARMA Recruit."
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </Link>

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
                  notifications={MOCK_PERSONAL_NOTIFICATIONS}
                  viewAllHref="/mypage/notifications"
                  scope="personal"
                />
                <AccountMenu />
              </>
            ) : (
              /* 개인·기업 헤더와 같은 순서(로그인 → 회원가입). 다만 이 헤더는 두 버튼 모두 LinkButton으로 둔다 —
                 개인 헤더가 생 Link를 쓰는 것은 그쪽 사정이고, 여기서는 이미 쓰고 있는 방식을 따르는 편이 낫다.
                 회원가입에 gradient/primary를 쓰지 않는 이유 — 이 헤더의 주 CTA는 "1:1 문의하기"다. */
              <>
                <LinkButton href={loginHref} variant="secondary" tone="dark" size="sm">
                  로그인
                </LinkButton>
                {/* 520px 미만에서만 접는다 — 개인·기업 헤더가 가입 버튼에 쓰는 것과 같은 기준이다.
                    로고(214px)와 로그인만으로 이미 꽉 차 390px에서 21px 넘쳤다. 로그인은 유일한 진입로라 항상 남긴다. */}
                <LinkButton href="/signup" variant="secondary" tone="dark" size="sm" className="max-[520px]:hidden">
                  회원가입
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
