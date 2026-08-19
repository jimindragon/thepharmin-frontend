import clsx from "clsx";
import Link from "next/link";
import { LockedContent } from "@/components/companies/LockedContent";
import { ReviewRatingStars } from "@/components/company/ReviewRatingStars";
import type { PharmacyReviewRating } from "@/config/pharmacyReviewForm";

export interface ReviewFeedItem {
  id: string;
  companyName: string;
  jobRole: string;
  writtenAt: string;
  tags: string[];
  outcome?: "합격" | "불합격";
  /** 지원(면접)한 시기. writtenAt(작성일)과 별개 — 값이 있을 때만 하단에 한 줄 노출한다. 면접 후기 피드에서만 채워진다 */
  applyYear?: number;
  applyHalf?: "상반기" | "하반기";
  /**
   * 약국 재직 후기의 종합 평가 별점. 값이 있을 때만 그린다(면접 후기 카드는 종전 그대로다).
   *
   * **잠금 위에 선다.** 기업 상세 카드가 별점·근무 메타를 잠금 밖에 두는 것과 같은 분할이다 —
   * 몇 점을 줬는지는 열지 않아도 보여야 후기끼리 견줄 수 있고, 왜 그런지가 열람 대상이다.
   */
  rating?: PharmacyReviewRating;
  /** 게이팅 대상이 아니면 항상 문자열, 잠긴 경우에만 서버에서부터 null로 내려온다 */
  preview: string | null;
}

interface ReviewFeedCardProps {
  review: ReviewFeedItem;
  /** 지정하면 카드 전체가 해당 기업의 상세 후기 페이지로 이동하는 오버레이 링크를 갖는다 */
  href?: string;
  lockedMessage?: string;
  lockedCtaLabel?: string;
  lockedCtaHref?: string;
  onLockedCtaClick?: () => void;
}

/** /companies 허브의 "최근 면접 후기" 카드와 같은 수준의 마크업을 전체 기업 크로스 피드(면접 후기/기업 리뷰)에서 재사용한다 */
export function ReviewFeedCard({ review, href, lockedMessage, lockedCtaLabel, lockedCtaHref, onLockedCtaClick }: ReviewFeedCardProps) {
  const locked = review.preview === null;
  const applyLabel = review.applyYear && review.applyHalf ? `${review.applyYear}년 ${review.applyHalf} 면접` : null;

  return (
    <article className="relative border border-border bg-white p-4">
      {href ? <Link href={href} aria-label={`${review.companyName} 후기 보기`} className="absolute inset-0 z-10" /> : null}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[15px] font-semibold text-[#171d26]">{review.companyName}</p>
        {review.outcome ? (
          <span
            className={clsx(
              "shrink-0 border px-2 py-0.5 text-[13px]",
              review.outcome === "합격" ? "border-[#111111] font-bold text-[#111111]" : "border-[#d9d9d9] font-medium text-[#777777]",
            )}
          >
            {review.outcome}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[12px] font-normal text-[#8a95a5]">
        {review.jobRole} · {review.writtenAt}
      </p>
      {review.rating ? <div className="mt-1.5"><ReviewRatingStars value={review.rating} size={13} /></div> : null}
      {applyLabel ? <p className="mt-1 text-[12px] font-normal text-[#9aa5b2]">{applyLabel}</p> : null}
      {review.tags.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span key={tag} className="border border-[#e4e9ef] bg-white px-2 py-1 text-[13px] font-medium text-[#687382]">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {locked ? (
        <LockedContent
          className="relative z-20 mt-3"
          lines={2}
          message={lockedMessage ?? ""}
          ctaLabel={lockedCtaLabel ?? ""}
          ctaHref={lockedCtaHref}
          onCtaClick={onLockedCtaClick}
        />
      ) : (
        <p className="mt-3 line-clamp-3 text-[13px] font-normal leading-[1.65] text-[#3f4855]">{review.preview}</p>
      )}
    </article>
  );
}
