import type { CompanyReviewCardItem, PharmacyReviewDisplay } from "@/components/company/CompanyReviewCard";
import { getCompanyTrack } from "@/data/companyDirectory";
import {
  getPharmacyReviewChoiceLabel,
  pharmacyReviewCardHighlights,
  pharmacyReviewNarrativeCardLabels,
} from "@/config/pharmacyReviewForm";
import { REVIEW_HIDDEN_NOTICE } from "@/config/reviewModeration";
import { getPharmacyOfficialReply } from "@/data/pharmacyReviewOwnerState";
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

/**
 * 약국 재직 후기인지 — 구조화 표시와 열람권 게이팅이 함께 이 판정을 쓴다.
 *
 * 기준은 데이터에 있는 필드(pharmacyAnswers)가 아니라 **기업의 트랙**이다. 값이 아직 안 채워진
 * 약국 후기가 게이팅에서 새는 일이 없어야 하고, 반대로 다른 트랙 후기에 어쩌다 답변이 붙어도
 * 공개 상태가 바뀌면 안 된다. 트랙은 companyDirectory가 단일 출처로 들고 있다.
 */
export function isPharmacyWorkReview(review: CompanyReview) {
  return review.type === "company" && getCompanyTrack(review.companyId) === "pharmacy";
}

/**
 * 허브 피드(/companies 홈 · /companies/reviews)가 약국 재직 후기 자리에 원문 대신 그리는 안내.
 *
 * 두 피드가 같은 문자열을 쓰도록 여기 둔다 — 잠금은 한 가지 사실을 말하는데 문구가 화면마다
 * 다르면 읽는 쪽에서는 서로 다른 제약으로 읽힌다.
 *
 * **피드는 열람 창구가 아니다.** CTA가 기업 상세로 보내기만 하고 열람권을 쓰지 않는 것이 핵심이다 —
 * 차감이 두 자리에서 일어나면 같은 지갑을 건드리는 곳이 늘고, 확인 모달·잔량 표시·열람 이력까지
 * 피드 쪽에 한 벌 더 생긴다. 열람은 기업 상세 한 곳에서만 한다.
 */
export const PHARMACY_REVIEW_FEED_LOCK = {
  message: "열람권으로 볼 수 있는 후기입니다",
  ctaLabel: "약국 상세에서 열람하기",
} as const;

/**
 * 허브 피드(/companies 홈 · /companies/reviews)에 내보낼 후기인지 — 비공개·삭제된 후기는 뺀다.
 *
 * **기업 상세와 갈리는 지점이고, 갈리는 것이 맞다.** 상세의 후기 목록은 자리표시를 남긴다
 * (REVIEW_HIDDEN_NOTICE): 그 약국의 후기가 3건인지 4건인지가 읽는 쪽에 뜻을 갖는 자리라,
 * 후기 수가 조용히 줄면 불리한 후기가 사라진 것을 알아볼 수 없다.
 *
 * 피드에는 그 뜻이 없다. 애초에 전량이 아니라 최신 몇 건을 흘려보내는 자리라 한 건이 빠진 것이
 * 아무 신호도 주지 않고, 읽을 것도 누를 것도 없는 카드가 격자 한 칸을 차지하면 "무엇을 읽을지
 * 고르는" 화면에서 고를 것만 흐려진다. 이력은 그 후기가 달린 기업 상세에 남아 있다.
 *
 * 판정을 함수로 빼 둔 것은 두 피드가 어긋나지 않게 하기 위해서다 — 이번 작업 자체가 두 피드가
 * 상세와 따로 놀아서 생긴 일이다.
 */
export function isFeedVisibleReview(review: CompanyReview) {
  return !review.hiddenReason;
}

/**
 * 약국 재직 후기의 구조화 표시값. 선택지 id를 화면 문구로 되돌리는 일이 전부 여기서 끝난다 —
 * 카드는 문항 정의(pharmacyReviewForm)를 알지 못한 채 문자열만 그린다.
 *
 * 답변이 없으면 undefined다. 그때 카드는 종전 기업 리뷰 모양 그대로 선다.
 */
export function toPharmacyReviewDisplay(review: CompanyReview): PharmacyReviewDisplay | undefined {
  const answers = review.pharmacyAnswers;
  if (!answers) return undefined;

  /* 근무 형태 · 근무 기간 · 근무 시기 — 기존 메타 행과 같은 가운뎃점 문법이다.
     라벨을 찾지 못한 값은 빼고 잇는다(문항에서 사라진 선택지를 든 옛 후기). */
  const meta = [
    getPharmacyReviewChoiceLabel("workType", answers.workType),
    getPharmacyReviewChoiceLabel("workPeriod", answers.workPeriod),
    `${answers.workYear}년`,
  ].filter((part): part is string => Boolean(part));

  /* flatMap으로 거르는 것은 값이 없는 행을 만든 뒤 지우지 않기 위해서다 —
     filter + 타입 술어를 쓰면 라벨의 리터럴 타입 때문에 술어가 도리어 좁아진다. */
  const highlights = pharmacyReviewCardHighlights.flatMap((highlight) => {
    const value = getPharmacyReviewChoiceLabel(highlight.field, answers[highlight.field]);
    return value ? [{ label: highlight.label as string, value }] : [];
  });

  const narratives = [
    { label: pharmacyReviewNarrativeCardLabels.goodPoints, text: review.goodPoints },
    { label: pharmacyReviewNarrativeCardLabels.badPoints, text: review.badPoints },
  ].flatMap((block) => (block.text ? [{ label: block.label, text: block.text }] : []));

  return { rating: review.overallRating, meta: meta.join(" · "), narratives, highlights };
}

/** 기업 리뷰(type: "company").
 *
 * 원문(content)은 그대로 담는다 — 잠글지는 호출부가 정한다. 약국 재직 후기는 열람권 게이팅 대상이라
 * 목록(PharmacyReviewsListClient)이 카드별로 잠금을 걸고, 그 외 세 트랙은 종전대로 전체 공개다.
 * 면접 후기와 같은 방식이다(아래 toInterviewCardItem 주석). */
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
    pharmacy: toPharmacyReviewDisplay(review),
    hiddenNotice: review.hiddenReason ? REVIEW_HIDDEN_NOTICE[review.hiddenReason] : undefined,
    officialReply: getPharmacyOfficialReply(review.id),
    isMine: review.isMine,
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
