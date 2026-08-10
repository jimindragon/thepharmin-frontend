"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { businessTabItems, type MobileTabItem } from "@/config/navigation";
import { useBusinessMember } from "@/hooks/useBusinessMember";

/**
 * 기업센터 ≤760px 하단 탭바.
 *
 * 개인 MobileTabBar를 items prop으로 일반화하지 않고 따로 둔 이유 —
 * 공유되는 것은 <nav> 껍데기와 5열 그리드뿐이고, 갈라지는 것이 더 많다:
 * 노출 allowlist, 세션 훅(usePersonalLoginState vs useBusinessMember),
 * 로그인 유도 대상(개인은 MY 한 칸 / 기업은 5칸 전부), 홈 활성 판정
 * (개인은 "/"라 startsWith가 통하지 않는 예외가 필요하지만 기업 홈은
 * /business/dashboard라 일반 prefix 규칙으로 끝난다).
 * 6개 주입점을 뚫어 개인 쪽을 일반화하는 비용이, 25줄 마크업을 한 벌 더
 * 두는 비용보다 크다. 개인 탭바는 손대지 않는다.
 */

/**
 * 탭바를 띄우는 1차 화면 목록. 정확히 일치할 때만 렌더한다(하위 경로 매칭 아님).
 *
 * 목록형 5개만 넣고 폼·상세를 뺀 이유는 개인 TAB_BAR_ROUTES와 같다:
 *   1) 앱 문법 — 탭바는 "어디로 갈까"를 고르는 자리다.
 *   2) 하단 고정 요소와의 충돌 회피. 기업 폼 5종(company/pharmacy/hospital/research
 *      프로필 + headhunting/manage/new)이 `sticky bottom-0 z-30` 저장바를 쓰고,
 *      /business/jobs/new/*도 같은 계열이다 — 목록에서 빼면 겹칠 일이 없다.
 */
const TAB_BAR_ROUTES: ReadonlySet<string> = new Set([
  "/business/dashboard",
  "/business/jobs",
  "/business/applicants",
  "/business/notifications",
  "/business/profile-hub",
]);

function isTabActive(item: MobileTabItem, pathname: string) {
  return item.activePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function BusinessTabBar() {
  const pathname = usePathname();
  const isMember = useBusinessMember();

  if (!TAB_BAR_ROUTES.has(pathname)) return null;

  return (
    // mobile-tabbar 마커 — globals.css가 이 클래스로 본문 하단 여백을 보정한다(body:has).
    <nav
      aria-label="기업 주요 메뉴"
      className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] min-[761px]:hidden"
    >
      <div className="grid h-[56px] grid-cols-5">
        {businessTabItems.map((item) => {
          const active = isTabActive(item, pathname);
          const Icon = item.icon;
          // 개인과 달리 5칸 전부 로그인이 필요하다 — 다섯 목적지 모두 BusinessCenterShell의
          // 로그인 안내판 뒤에 있다. 라벨·아이콘은 그대로 두어 자리가 바뀌지 않게 한다.
          const href = isMember ? item.href : `/business/login?redirect=${encodeURIComponent(item.href)}`;

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center justify-center gap-1",
                active ? "text-[#111111]" : "text-[#8a94a3]",
              )}
            >
              <Icon size={20} aria-hidden />
              <span className={clsx("text-[11px] leading-none", active ? "font-medium" : "font-normal")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
