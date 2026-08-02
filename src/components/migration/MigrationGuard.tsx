"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { useMemberMigration } from "@/hooks/useMemberMigration";

/**
 * 미전환 회원을 재동의 화면(/migration)으로 보내는 감시자.
 *
 * 루트 레이아웃에 두는 이유 — 개인 영역을 한 곳에서 덮을 수 있는 자리가 여기뿐이다.
 * 이 프로젝트의 layout.tsx는 root·companies/(hub)·companies/[companyId] 셋뿐이고 개인 영역 공통
 * 셸이 없다(각 페이지가 <Header />를 직접 렌더한다). 미들웨어도 답이 아니다 — 전환 여부는
 * localStorage에 있어 서버가 읽을 수 없다.
 *
 * 그래서 판정은 클라이언트에서 한다. 첫 렌더에는 저장소를 아직 못 읽어 원래 화면이 잠깐 보이는데,
 * useMemberMigration의 기본값이 "전환 완료"라 전환을 마친 대다수에게는 깜빡임이 아예 없고
 * 미전환자에게만 한 틱 늦게 뜬다. 그 한 틱 뒤부터 이동이 끝날 때까지는 아래 가림막으로 덮는다.
 */

/**
 * 막지 않는 경로.
 *   /migration   — 이관 화면 자체(여기서 막으면 무한 이동)
 *   /login /signup — 신규 가입자와 무관
 *   /business    — 기업 계정은 이관 대상이 아님
 *   /pharmacy-preview — 기업 담당자가 브랜드 페이지를 확인하는 화면. /business 밖에 있는 것은
 *                      라우트 설계상의 사정일 뿐이고 성격은 기업센터 화면이라 개인 이관과 무관하다
 *   /support     — 이관 중 문제가 생긴 사람이 문의할 곳
 * 하위 경로까지 함께 열어 준다(`/login/reset/new`, `/business/dashboard` 등).
 */
const EXEMPT_PREFIXES = ["/migration", "/login", "/signup", "/business", "/pharmacy-preview", "/support"] as const;

export function isExemptFromMigration(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * 형제가 아니라 children을 감싸는 이유 — 막을 화면을 아예 렌더하지 않아야 한다.
 *
 * 형제로 두었더니 /jobs가 뚫렸다. useJobFilters(hooks/useJobFilters.ts:530)가 Next 라우터를 거치지
 * 않고 `window.history.replaceState`로 직접 주소를 쓰기 때문에, 감시자가 /migration으로 옮겨 놓아도
 * 아직 살아 있는 목록 화면이 곧바로 주소를 /jobs로 되돌려 놓았다.
 * 감싸서 children을 통째로 내리면 그런 화면이 주소를 만질 기회 자체가 없어진다.
 */
export function MigrationGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = usePersonalLoginState();
  const { isMigrated } = useMemberMigration();

  // 개인 로그인 상태 + 미전환 + 예외 경로가 아닐 때만. 비로그인은 막지 않는다.
  const shouldRedirect = isLoggedIn && !isMigrated && !isExemptFromMigration(pathname);

  useEffect(() => {
    if (!shouldRedirect) return;

    /**
     * 쿼리까지 붙여 원래 가려던 곳을 그대로 복원한다. useSearchParams를 쓰지 않는 이유 —
     * 루트 레이아웃에서 그 훅을 쓰면 앱 전체가 Suspense 경계를 요구하게 된다. 여기서는 렌더 중이
     * 아니라 이펙트 안이라 window를 직접 읽어도 하이드레이션에 영향이 없다.
     */
    const target = `${pathname}${window.location.search}`;
    router.replace(`/migration?redirect=${encodeURIComponent(target)}`);
  }, [shouldRedirect, pathname, router]);

  // 판정이 선 뒤부터 이동이 끝날 때까지 원래 화면을 내리고 빈 배경만 둔다 — router.replace는 즉시 끝나지 않는다.
  if (shouldRedirect) return <div aria-hidden className="min-h-screen bg-[#f5f6f7]" />;

  return <>{children}</>;
}
