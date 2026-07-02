import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyInterviewsListClient } from "@/components/company/CompanyInterviewsListClient";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyInterviewsPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ guest?: string; reviewer?: string }>;
}

export const metadata: Metadata = {
  title: "면접 후기 | THE PHARMA Recruit.",
};

/** 허브의 /companies/interviews와 동일한 guest/reviewer 게이팅 규칙을 개별 기업 페이지에도 그대로 적용한다.
 * KeywordReview 기반 요약 섹션은 제거됐다 — companyReviews 원문 목록 하나가 이 페이지의 전체 내용이다. */
export default async function CompanyInterviewsPage({ params, searchParams }: CompanyInterviewsPageProps) {
  const { companyId } = await params;
  const sp = await searchParams;
  const isLoggedIn = sp.guest !== "true";
  const hasWrittenInterviewReview = sp.reviewer === "true";
  const canRead = isLoggedIn && hasWrittenInterviewReview;

  const profile = getCompanyProfile(companyId);

  const items = companyReviews
    .filter((review) => review.companyId === companyId && review.type === "interview")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => ({
      id: review.id,
      tags: review.tags,
      content: canRead ? review.content : null,
      jobRole: review.jobRole,
      authorStatus: review.authorStatus,
      writtenAt: review.writtenAt,
      helpfulCount: review.helpfulCount,
    }));

  const body = <CompanyInterviewsListClient items={items} isLoggedIn={isLoggedIn} />;

  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
