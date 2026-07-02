"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { companyReviews } from "@/data/companies";
import type { CompanyProfile } from "@/data/companyProfiles";

/** 앵커 스크롤 대신 실제 라우트로 이동하는 탭. (hub)/layout.tsx의 CompaniesHubTabs와 동일한 패턴(border-radius: 0).
 * 카운트는 전부 실제 데이터 length — 프로필에 하드코딩된 숫자를 신뢰하지 않는다. */
export function CompanyDetailTabs({ companyId, profile }: { companyId: string; profile: CompanyProfile }) {
  const pathname = usePathname();

  const interviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "interview").length;
  const companyReviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "company").length;

  const tabs = [
    { href: `/companies/${companyId}`, label: "기업 개요" },
    { href: `/companies/${companyId}/jobs`, label: `채용공고 ${profile.jobs.length}` },
    { href: `/companies/${companyId}/interviews`, label: `면접 후기 ${interviewCount}` },
    { href: `/companies/${companyId}/reviews`, label: `기업 리뷰 ${companyReviewCount}` },
    { href: `/companies/${companyId}/news`, label: `뉴스 ${profile.news.length}` },
  ];

  return (
    <nav className="mt-6 flex h-11 w-fit overflow-x-auto overflow-hidden border border-[#dfe4ea] bg-white" role="tablist" aria-label="기업 정보 메뉴">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
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
