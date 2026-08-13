import type { CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";
import type { CompanyReview } from "@/types/jobs";

/**
 * companyReviews(원본) → CompanyReviewCard가 받는 표시용 항목 매핑.
 *
 * 기업 리뷰 목록(/companies/{id}/reviews)과 기업 개요의 인라인 펼침이 같은 카드를 그리므로 매핑도 한 곳에 둔다 —
 * 두 곳에 각각 적어 두면 한쪽만 필드가 늘어 같은 후기가 화면마다 다르게 보인다(실제로 개요 쪽 매핑에
 * applyYear/applyHalf가 빠져 있어 "2024년 상반기 지원" 한 줄이 개요에서만 사라졌다).
 *
 * 원본을 그대로 넘기지 않고 필드를 하나씩 옮기는 것은 종전 그대로다 — 새 필드가 필요해지면 여기서 명시적으로 더한다.
 */

/** 기업 리뷰(type: "company"). 이 앱 어디에도 열람 게이팅이 없어 원문을 항상 담는다. */
export function toCompanyReviewCardItem(review: CompanyReview): CompanyReviewCardItem {
  return {
    id: review.id,
    tags: review.tags,
    content: review.content,
    jobRole: review.jobRole,
    authorStatus: review.authorStatus,
    writtenAt: review.writtenAt,
    helpfulCount: review.helpfulCount,
    applyYear: review.applyYear,
    applyHalf: review.applyHalf,
  };
}
