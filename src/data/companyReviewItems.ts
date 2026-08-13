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

/**
 * 면접 후기(type: "interview"). **원문을 담는다.**
 *
 * 잠금은 서버가 content를 비워서가 아니라 클라이언트의 열람권 상태기계(useInterviewAccess)가 건다 —
 * 면접 후기 목록(/companies/{id}/interviews)이 처음부터 그렇게 동작했고, 기업 개요의 인라인 펼침이
 * 그 목록을 통째로 재사용하면서 개요 응답에도 같은 원문이 실리게 됐다. 목업 단계에서 받아들인
 * 비용이다(실서비스에서는 펼칠 때 가져오는 지연 로딩으로 바꿀 자리).
 *
 * isMine은 그대로 옮긴다 — 내가 쓴 후기는 게이팅과 무관하게 원문이 보여야 한다.
 */
export function toInterviewCardItem(review: CompanyReview): CompanyReviewCardItem {
  return {
    id: review.id,
    tags: review.tags,
    content: review.content,
    jobRole: review.jobRole,
    authorStatus: review.authorStatus,
    writtenAt: review.writtenAt,
    helpfulCount: review.helpfulCount,
    interviewDifficulty: review.interviewDifficulty,
    interviewFormat: review.interviewFormat,
    applyYear: review.applyYear,
    applyHalf: review.applyHalf,
    isInterview: true,
    isMine: review.isMine,
  };
}
