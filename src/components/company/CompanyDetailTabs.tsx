"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCompanyDetailCounts, getCompanyTrack } from "@/data/companyDirectory";

/** 앵커 스크롤 대신 실제 라우트로 이동하는 탭. (hub)/layout.tsx의 CompaniesHubTabs와 동일한 패턴(border-radius: 0).
 * 카운트는 전부 실제 데이터 length — 프로필에 하드코딩된 숫자를 신뢰하지 않는다(getCompanyDetailCounts). */
export function CompanyDetailTabs({ companyId }: { companyId: string }) {
  const pathname = usePathname();

  const counts = getCompanyDetailCounts(companyId);
  const track = getCompanyTrack(companyId);
  // 뉴스 탭은 산업 트랙 전용이다(N3 상세 개편) — profile.news 데이터 자체는 다른 트랙도 삭제하지 않고 그대로 둔다.
  // 병원(snubh 등)은 실제로 news를 채워둔 프로필이 있어도 탭을 숨기므로, 트랙별 개수 유무가 아니라 트랙 자체가
  // 기준이다. 이전엔 "병원·약국이 아니면 노출"(블록리스트)이라 연구 트랙(STEP 4에서 신설)이 걸러지지 않고 샜다 —
  // 명시적 허용리스트로 바꿔 향후 새 트랙이 추가돼도 기본은 숨김이 되게 한다.
  const showNewsTab = track === "industry";

  const tabs = [
    { href: `/companies/${companyId}`, label: "기업 개요" },
    { href: `/companies/${companyId}/jobs`, label: `채용공고 ${counts.jobs}` },
    { href: `/companies/${companyId}/interviews`, label: `면접 후기 ${counts.interviews}` },
    { href: `/companies/${companyId}/reviews`, label: `기업 리뷰 ${counts.reviews}` },
    ...(showNewsTab ? [{ href: `/companies/${companyId}/news`, label: `뉴스 ${counts.news}` }] : []),
  ];

  const rootHref = `/companies/${companyId}`;

  /**
   * ≤760px 개요 탭에서만 이 행을 숨긴다 — 그 자리는 SectionAnchorNav가 대신한다. 좁은 화면에서
   * 히어로 바로 밑에 가로 스크롤 탭 행이 둘(라우트 탭·섹션 앵커) 쌓이는 것이 실기기에서 걸린 문제고,
   * 개요 본문은 네 목적지(공고·면접 후기·기업 리뷰·뉴스)를 미리보기 섹션으로 모두 갖고 있어
   * 앵커 + 각 섹션의 "전체 보기" 링크만으로 같은 페이지에 전부 닿는다. 앵커가 흡수한 건수는
   * getCompanyDetailCounts로 이 행과 같은 출처를 쓴다.
   *
   * 하위 탭(/jobs·/interviews·/reviews·/news)에서는 그대로 둔다 — 그쪽에는 앵커 행이 없어
   * 여기까지 숨기면 좁은 화면에서 기업 상세 안을 오갈 수단이 사라진다.
   *
   * 개요에서 앵커가 렌더되지 않는 경우는 없다: 소개·정보 카드와 면접 후기·기업 리뷰 미리보기는
   * 0건이어도 빈 상태로 남아 항상 4섹션 이상이라 MIN_SECTIONS(3) 아래로 내려가지 않는다.
   */
  const isOverview = pathname === rootHref;

  // nav는 w-fit으로 탭 총폭(최대 5개, ~473px)만큼만 차지하되 max-w-full로 부모(app-shell) 폭에 갇힌다 —
  // max-w-full 없이 w-fit만 두면 좁은 화면(390px 등)에서 nav가 부모를 넘어 문서 전체에 가로 스크롤이 생겼다.
  // 넘치는 분량은 nav 내부에서만 가로 스크롤한다(overflow-hidden은 overflow-x-auto와 서로 덮어써 제거했다).
  return (
    <nav
      className={clsx(
        "mt-6 flex h-11 w-fit max-w-full overflow-x-auto overflow-y-hidden border border-border bg-white",
        isOverview && "max-[760px]:hidden",
      )}
      role="tablist"
      aria-label="기업 정보 메뉴"
    >
      {tabs.map((tab) => {
        // 기업 개요 탭(루트 href)은 정확 일치만 활성으로 본다 — 하위 경로 매칭을 적용하면 모든 하위 페이지에서 항상 활성이 되어버린다.
        // 그 외 탭은 목록 페이지(/interviews)뿐 아니라 하위 경로(/interviews/new 등)에서도 활성으로 본다.
        const active = tab.href === rootHref ? pathname === tab.href : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full shrink-0 items-center justify-center whitespace-nowrap px-5 text-[14px] font-medium transition-colors",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
