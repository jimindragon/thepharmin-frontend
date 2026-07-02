import clsx from "clsx";
import Link from "next/link";
import { LockedContent } from "@/components/companies/LockedContent";

export interface ReviewFeedItem {
  id: string;
  companyName: string;
  jobRole: string;
  writtenAt: string;
  tags: string[];
  outcome?: "합격" | "불합격";
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

  return (
    <article className="relative border border-[#e5e9ef] bg-white p-4">
      {href ? <Link href={href} aria-label={`${review.companyName} 후기 보기`} className="absolute inset-0 z-10" /> : null}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-[#596373]">{review.companyName}</p>
        {review.outcome ? (
          <span
            className={clsx(
              "shrink-0 border px-2 py-0.5 text-[11px]",
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
      {review.tags.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span key={tag} className="border border-[#e4e9ef] bg-white px-2 py-1 text-[11px] font-medium text-[#687382]">
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
