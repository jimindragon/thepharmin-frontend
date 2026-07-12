import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyReviewCard } from "@/components/company/CompanyReviewCard";
import { CompanyReviewWriteCard } from "@/components/company/CompanyReviewWriteCard";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyReviewsPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ guest?: string }>;
}

export const metadata: Metadata = {
  title: "기업 리뷰 | THE PHARMA Recruit.",
};

/** 기업 리뷰(회사 후기)는 이 앱 어디에도 열람 게이팅이 없다 — 1A와 동일한 기준으로 항상 원문을 내려준다.
 * KeywordReview 기반 요약 섹션(긍정/개선 키워드 포함)은 제거됐다 — companyReviews 원문 목록 하나가 이 페이지의 전체 내용이다.
 * 작성 카드의 로그인 분기만 interviews/page.tsx와 동일한 ?guest=true 컨벤션을 재사용한다 — 본문 열람 게이팅과는 무관하다. */
export default async function CompanyReviewsPage({ params, searchParams }: CompanyReviewsPageProps) {
  const { companyId } = await params;
  const sp = await searchParams;
  const isLoggedIn = sp.guest !== "true";
  const profile = getCompanyProfile(companyId);

  const items = companyReviews
    .filter((review) => review.companyId === companyId && review.type === "company")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => ({
      id: review.id,
      tags: review.tags,
      content: review.content,
      jobRole: review.jobRole,
      authorStatus: review.authorStatus,
      writtenAt: review.writtenAt,
      helpfulCount: review.helpfulCount,
      applyYear: review.applyYear,
      applyHalf: review.applyHalf,
    }));

  const body = (
    <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
      <CompanyReviewWriteCard companyId={companyId} reviewType="company" isLoggedIn={isLoggedIn} hasItems={items.length > 0} />
      {items.map((item) => (
        <CompanyReviewCard key={item.id} review={item} />
      ))}
    </div>
  );

  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
