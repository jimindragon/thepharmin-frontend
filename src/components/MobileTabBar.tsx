"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileTabItems, type MobileTabItem } from "@/config/navigation";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

const MY_TAB_HREF = "/mypage/dashboard";

/**
 * 탭바를 띄우는 1차 화면 목록. 정확히 일치할 때만 렌더한다(하위 경로 매칭 아님).
 *
 * 상세·폼·에러 화면을 뺀 이유는 두 가지다.
 *   1) 앱 문법 — 탭바는 "어디로 갈까"를 고르는 자리이고, 상세·폼은 이미 고른 뒤의 화면이다.
 *   2) 하단 fixed/sticky 요소와의 충돌 회피. /jobs/[slug]의 지원 CTA 바(fixed bottom-0 z-40)와
 *      /mypage/resume/*의 저장바(sticky bottom-0)가 같은 자리를 쓴다 — 목록에서 빼면 겹칠 일이 없다.
 */
const TAB_BAR_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/jobs",
  "/jobs/industry",
  "/jobs/research",
  "/jobs/hospital",
  "/jobs/pharmacy",
  "/qna",
  "/calendar",
  "/mypage/dashboard",
]);

/**
 * Header.tsx의 데스크톱 nav와 같은 방식(정확히 일치 또는 하위 경로)이되, 홈만 예외다 —
 * "/"에 startsWith를 그대로 적용하면 모든 경로가 홈으로 잡힌다.
 */
function isTabActive(item: MobileTabItem, pathname: string) {
  if (item.href === "/") return pathname === "/";
  return item.activePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { isLoggedIn } = usePersonalLoginState();

  if (!TAB_BAR_ROUTES.has(pathname)) return null;

  return (
    // mobile-tabbar 마커 — globals.css가 이 클래스로 본문 하단 여백을 보정한다(body:has).
    <nav
      aria-label="주요 메뉴"
      className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] min-[761px]:hidden"
    >
      <div className="grid h-[56px] grid-cols-5">
        {mobileTabItems.map((item) => {
          const active = isTabActive(item, pathname);
          const Icon = item.icon;
          // 비로그인 MY 탭은 로그인으로 보낸다 — 라벨·아이콘은 그대로 두어 자리가 바뀌지 않게 한다.
          const href =
            item.href === MY_TAB_HREF && !isLoggedIn
              ? `/login?redirect=${encodeURIComponent(MY_TAB_HREF)}`
              : item.href;

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
