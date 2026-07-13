"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { companyReviews } from "@/data/companies";
import { getActiveJobCount, getCompanyTrack } from "@/data/companyDirectory";
import type { CompanyProfile } from "@/data/companyProfiles";

/** 앵커 스크롤 대신 실제 라우트로 이동하는 탭. (hub)/layout.tsx의 CompaniesHubTabs와 동일한 패턴(border-radius: 0).
 * 카운트는 전부 실제 데이터 length — 프로필에 하드코딩된 숫자를 신뢰하지 않는다. */
export function CompanyDetailTabs({ companyId, profile }: { companyId: string; profile: CompanyProfile }) {
  const pathname = usePathname();

  const interviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "interview").length;
  const companyReviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "company").length;
  const track = getCompanyTrack(companyId);
  // 뉴스 탭은 산업 트랙 전용이다(N3 상세 개편) — profile.news 데이터 자체는 다른 트랙도 삭제하지 않고 그대로 둔다.
  // 병원(snubh 등)은 실제로 news를 채워둔 프로필이 있어도 탭을 숨기므로, 트랙별 개수 유무가 아니라 트랙 자체가
  // 기준이다. 이전엔 "병원·약국이 아니면 노출"(블록리스트)이라 연구 트랙(STEP 4에서 신설)이 걸러지지 않고 샜다 —
  // 명시적 허용리스트로 바꿔 향후 새 트랙이 추가돼도 기본은 숨김이 되게 한다.
  const showNewsTab = track === "industry";

  const tabs = [
    { href: `/companies/${companyId}`, label: "기업 개요" },
    { href: `/companies/${companyId}/jobs`, label: `채용공고 ${getActiveJobCount(companyId)}` },
    { href: `/companies/${companyId}/interviews`, label: `면접 후기 ${interviewCount}` },
    { href: `/companies/${companyId}/reviews`, label: `기업 리뷰 ${companyReviewCount}` },
    ...(showNewsTab ? [{ href: `/companies/${companyId}/news`, label: `뉴스 ${profile.news.length}` }] : []),
  ];

  const rootHref = `/companies/${companyId}`;

  return (
    <nav className="mt-6 flex h-11 w-fit overflow-x-auto overflow-hidden border border-[#dfe4ea] bg-white" role="tablist" aria-label="기업 정보 메뉴">
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
