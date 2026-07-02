import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyReviewCard } from "@/components/company/CompanyReviewCard";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyReviewsPageProps {
  params: Promise<{ companyId: string }>;
}

export const metadata: Metadata = {
  title: "기업 리뷰 | THE PHARMA Recruit.",
};

/** 기업 리뷰(회사 후기)는 이 앱 어디에도 열람 게이팅이 없다 — 1A와 동일한 기준으로 항상 원문을 내려준다.
 * KeywordReview 기반 요약 섹션(긍정/개선 키워드 포함)은 제거됐다 — companyReviews 원문 목록 하나가 이 페이지의 전체 내용이다. */
export default async function CompanyReviewsPage({ params }: CompanyReviewsPageProps) {
  const { companyId } = await params;
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
    }));

  const body = items.length ? (
    <div className="mt-6 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
      {items.map((item) => (
        <CompanyReviewCard key={item.id} review={item} typeLabel="기업 리뷰" />
      ))}
    </div>
  ) : (
    <div className="mt-6 flex h-[140px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] text-center">
      <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 기업 리뷰가 없습니다.</p>
      <p className="text-[13px] font-normal text-[#8791a0]">새로운 리뷰가 등록되면 이 페이지에서 확인할 수 있습니다.</p>
    </div>
  );

  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
