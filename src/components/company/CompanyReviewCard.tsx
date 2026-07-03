"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bookmark, ThumbsUp } from "lucide-react";
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
  /** 면접 후기에만 존재. 값이 있을 때만 하단 액션 행에 합/불 배지를 그린다 */
  outcome?: "합격" | "불합격";
}

interface CompanyReviewCardProps {
  review: CompanyReviewCardItem;
  lockedMessage?: string;
  lockedCtaLabel?: string;
  lockedCtaHref?: string;
  lockedCtaVariant?: "outline" | "gradient";
  onLockedCtaClick?: () => void;
}

/** [companyId]/reviews, [companyId]/interviews가 공유하는 전용 페이지 카드.
 * 원문 게이팅 대상(면접 후기)만 content가 null로 내려오며, 그 경우 태그·메타는 그대로 두고 원문 영역만 잠근다. */
export function CompanyReviewCard({ review, lockedMessage, lockedCtaLabel, lockedCtaHref, lockedCtaVariant, onLockedCtaClick }: CompanyReviewCardProps) {
  const locked = review.content === null;
  const [helpful, setHelpful] = useState({ active: false, count: review.helpfulCount });
  const [saved, setSaved] = useState(false);

  return (
    <article className="border border-[#e5e9ef] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-[#3f4855]">
          {review.jobRole} · {review.authorStatus}
        </span>
        <span className="shrink-0 text-[11px] font-normal text-[#9aa5b2]">{review.writtenAt}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {review.tags.map((tag) => (
          <span key={tag} className="border border-[#e4e9ef] bg-[#f8fafb] px-2 py-1 text-[11px] font-medium text-[#596373]">
            {tag}
          </span>
        ))}
      </div>
      {locked ? (
        <LockedContent
          className="mt-3"
          lines={3}
          message={lockedMessage ?? ""}
          ctaLabel={lockedCtaLabel ?? ""}
          ctaHref={lockedCtaHref}
          ctaVariant={lockedCtaVariant}
          onCtaClick={onLockedCtaClick}
        />
      ) : (
        <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#3f4855]">{review.content}</p>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-3 text-[11px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHelpful((prev) => ({ active: !prev.active, count: prev.count + (prev.active ? -1 : 1) }))}
            aria-pressed={helpful.active}
            className={clsx("inline-flex items-center gap-1 font-normal transition", helpful.active ? "text-[#111111]" : "text-[#8a95a5] hover:text-[#111111]")}
          >
            <ThumbsUp size={12} />
            도움돼요 {helpful.count}
          </button>
          <button
            type="button"
            onClick={() => setSaved((prev) => !prev)}
            aria-pressed={saved}
            className={clsx("inline-flex items-center gap-1 font-normal transition", saved ? "text-[#111111]" : "text-[#8a95a5] hover:text-[#111111]")}
          >
            <Bookmark size={12} className={saved ? "fill-current" : undefined} />
            저장
          </button>
        </div>
        {review.outcome ? (
          <span
            className={clsx(
              "border px-2 py-0.5",
              review.outcome === "합격" ? "border-[#111111] font-bold text-[#111111]" : "border-[#d9d9d9] font-medium text-[#777777]",
            )}
          >
            {review.outcome}
          </span>
        ) : null}
      </div>
    </article>
  );
}
