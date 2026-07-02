import { ThumbsUp } from "lucide-react";
import { LockedContent } from "@/components/companies/LockedContent";

export interface CompanyReviewCardItem {
  id: string;
  tags: string[];
  /** 게이팅 대상이 아니면 항상 문자열, 잠긴 경우에만 서버에서부터 null로 내려온다 */
  content: string | null;
  jobRole: string;
  authorStatus: string;
  writtenAt: string;
  helpfulCount: number;
}

interface CompanyReviewCardProps {
  review: CompanyReviewCardItem;
  typeLabel: string;
  lockedMessage?: string;
  lockedCtaLabel?: string;
  lockedCtaHref?: string;
  onLockedCtaClick?: () => void;
}

/** 기존 /companies/[companyId]/reviews/page.tsx의 원문 리뷰 카드 마크업을 그대로 재사용한다 */
export function CompanyReviewCard({ review, typeLabel, lockedMessage, lockedCtaLabel, lockedCtaHref, onLockedCtaClick }: CompanyReviewCardProps) {
  const locked = review.content === null;

  return (
    <article className="rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">{typeLabel}</span>
        <span className="text-[11px] font-normal text-[#9aa5b2]">{review.writtenAt}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {review.tags.map((tag) => (
          <span key={tag} className="rounded-[var(--radius)] border border-[#e4e9ef] bg-white px-2 py-1 text-[11px] font-medium text-[#687382]">
            {tag}
          </span>
        ))}
      </div>
      {locked ? (
        <LockedContent
          className="mt-3"
          lines={2}
          message={lockedMessage ?? ""}
          ctaLabel={lockedCtaLabel ?? ""}
          ctaHref={lockedCtaHref}
          onCtaClick={onLockedCtaClick}
        />
      ) : (
        <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#3f4855]">{review.content}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] font-normal text-[#8a95a5]">
        <span>
          {review.jobRole} · {review.authorStatus}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsUp size={12} />
          {review.helpfulCount}
        </span>
      </div>
    </article>
  );
}
