import type { Metadata } from "next";
import { ReviewFeedCard } from "@/components/companies/ReviewFeedCard";
import { companies, companyReviews } from "@/data/companies";

export const metadata: Metadata = {
  title: "기업 리뷰 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국 전체 기업의 기업 리뷰를 모아 확인하세요.",
};

/** 기업 리뷰(회사 후기)는 이 앱 어디에도 열람 게이팅이 없다 — 기존 규칙 그대로 항상 원문을 내려준다 */
export default function CompaniesReviewsPage() {
  const items = companyReviews
    .filter((review) => review.type === "company")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => {
      const company = companies.find((item) => item.id === review.companyId);

      return {
        id: review.id,
        companyId: review.companyId,
        companyName: company?.name ?? "기업",
        jobRole: review.jobRole,
        writtenAt: review.writtenAt,
        tags: review.tags,
        preview: review.content,
      };
    });

  return (
    <section className="mt-8">
      <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">전체 기업 리뷰</h2>

      {items.length ? (
        <div className="mt-5 grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {items.map((item) => (
            <ReviewFeedCard key={item.id} review={item} href={`/companies/${item.companyId}/reviews`} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
          <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 기업 리뷰가 없습니다.</p>
        </div>
      )}
    </section>
  );
}
