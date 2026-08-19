import type { Metadata } from "next";
import Link from "next/link";
import { ReviewFeedCard } from "@/components/companies/ReviewFeedCard";
import { companies, companyReviews } from "@/data/companies";
import { PHARMACY_REVIEW_FEED_LOCK, isFeedVisibleReview, isPharmacyWorkReview } from "@/data/companyReviewItems";

export const metadata: Metadata = {
  title: "기업 리뷰 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국 전체 기업의 기업 리뷰를 모아 확인하세요.",
};

/**
 * 기업 리뷰 크로스 피드.
 *
 * **약국 재직 후기만 잠긴다.** 그쪽은 기업 상세에서 열람권으로 잠기는데(PharmacyReviewsListClient)
 * 이 피드가 같은 후기의 원문을 그대로 내보내고 있었다 — 약국 후기의 content는 goodPoints 요약이라,
 * 잠금 아래에 있어야 할 서술 절반이 여기서 읽혔다. 잠금의 옆문이라 여기서 닫는다.
 *
 * 나머지 세 트랙의 재직 후기는 종전 그대로 전체 공개다. 판정은 기업 상세와 같은
 * isPharmacyWorkReview 하나를 쓴다 — 두 곳이 각자 판정하면 트랙 하나가 늘 때 한쪽만 샌다.
 */
export default function CompaniesReviewsPage() {
  const items = companyReviews
    /* 비공개·삭제된 후기는 피드에서 뺀다 — 자리표시를 남기는 것은 기업 상세의 몫이다(isFeedVisibleReview) */
    .filter((review) => review.type === "company" && isFeedVisibleReview(review))
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => {
      const company = companies.find((item) => item.id === review.companyId);
      const locked = isPharmacyWorkReview(review);

      return {
        id: review.id,
        companyId: review.companyId,
        companyName: company?.name ?? "기업",
        jobRole: review.jobRole,
        writtenAt: review.writtenAt,
        tags: review.tags,
        /* 별점은 잠금 위에 남는다 — 기업 상세의 "잠금 위/아래 분할"과 같은 규칙이다 */
        rating: review.overallRating,
        /* 원문을 서버에서부터 비운다. 클라이언트 상태기계가 거는 기업 상세 쪽 잠금과 달리
           이 피드에는 열 수단이 없으므로, 페이로드에 실어 보낼 이유도 없다. */
        preview: locked ? null : review.content,
      };
    });

  return (
    <>
      <Link href="/companies" className="mt-8 inline-flex items-center text-[13px] font-medium text-[#596373] transition hover:text-[#111111]">
        ← 기업 인사이트
      </Link>
      <section className="mt-8">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#111111]">전체 기업 리뷰</h2>

        {items.length ? (
          <div className="mt-5 grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
            {items.map((item) => (
              /* 잠금 CTA는 기업 상세의 리뷰 탭으로 보내기만 한다 — 열람권 차감은 그 화면 한 곳에서만
                 일어난다(PHARMACY_REVIEW_FEED_LOCK 주석). 카드 전체 오버레이 링크와 같은 목적지다. */
              <ReviewFeedCard
                key={item.id}
                review={item}
                href={`/companies/${item.companyId}/reviews`}
                lockedMessage={PHARMACY_REVIEW_FEED_LOCK.message}
                lockedCtaLabel={PHARMACY_REVIEW_FEED_LOCK.ctaLabel}
                lockedCtaHref={`/companies/${item.companyId}/reviews`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
            <p className="text-[15px] font-medium text-[#303946]">아직 등록된 기업 리뷰가 없습니다.</p>
          </div>
        )}
      </section>
    </>
  );
}
