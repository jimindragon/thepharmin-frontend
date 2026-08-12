"use client";

import { usePathname } from "next/navigation";
import { CompanyHero } from "@/components/company/CompanyHero";
import type { CompanyProfile } from "@/data/companyProfiles";

/**
 * [companyId]/layout.tsx의 히어로 자리. 개요 탭은 풀 히어로, 하위 탭(공고·면접 후기·기업 리뷰·뉴스와
 * 그 아래 후기 작성 화면)은 컴팩트 바를 쓴다 — 개요=요약 / 하위 탭=전체 목록이라는 역할 분리를
 * 화면 맨 위에서 먼저 알린다. 실제로 갈아입는 폭은 ≤760px뿐이다(CompanyHero의 variant 주석 참고).
 *
 * layout.tsx가 서버 컴포넌트라 usePathname을 쓸 수 없어 히어로만 이 클라이언트 래퍼로 감싼다.
 * 라우트 그룹으로 layout을 둘로 쪼개는 방법도 있지만, 그러려면 페이지 6개가 디렉터리를 옮겨야 해
 * 한 컴포넌트로 끝나는 이쪽을 골랐다.
 *
 * 활성 판정은 CompanyDetailTabs와 같은 규칙이다 — 루트 href **정확 일치**만 개요로 본다.
 * 하위 경로 매칭을 쓰면 모든 탭이 개요로 잡힌다.
 */
export function CompanyDetailHero({ profile, companyId }: { profile: CompanyProfile; companyId: string }) {
  const pathname = usePathname();
  const isOverview = pathname === `/companies/${companyId}`;

  return <CompanyHero profile={profile} variant={isOverview ? "full" : "compact"} />;
}
