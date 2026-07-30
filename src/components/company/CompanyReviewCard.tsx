"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bookmark, Quote, ThumbsUp } from "lucide-react";
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
  /** 면접 후기에만 존재. 값이 있을 때만 난이도·유형 배지를 그린다 */
  interviewDifficulty?: "상" | "중" | "하";
  /** 면접 후기에만 존재. 값이 있을 때만 난이도·유형 배지를 그린다 */
  interviewFormat?: string;
  /** 지원(면접)한 시기. writtenAt(작성일)과 별개 — 값이 있을 때만 하단에 한 줄 노출한다 */
  applyYear?: number;
  applyHalf?: "상반기" | "하반기";
  /** "지원"/"면접" 표현 분기용 — 면접 후기 목록에서만 true로 내려온다 */
  isInterview?: boolean;
  /** 현재 로그인 사용자가 작성한 후기인지. interviewAccess 게이팅과 무관하게 항상 원문을 노출해야 한다. */
  isMine?: boolean;
}

/** 면접 후기 열람권(credit) 게이팅 상태. 값이 있으면 review.content 유무와 무관하게 이 상태에 따라
 * 본문을 잠근다 — interviews 탭(CompanyInterviewsListClient)에서만 전달되고, 그 외 사용처는 undefined다. */
export interface CompanyReviewInterviewAccess {
  status: "loggedOut" | "noCredits" | "canUnlock";
  /** canUnlock일 때 보조 문구("보유 n장")에 쓰는 현재 보유 장수 */
  credits: number;
  /** noCredits 상태의 CTA("후기 작성하고 열람권 받기")가 이동할 작성 페이지 링크 */
  writeHref: string;
  /** canUnlock 상태의 CTA("1장 사용하고 보기") 클릭 시 상위(부모)가 확인 모달을 띄우도록 위임 */
  onUnlockRequest: () => void;
}

interface CompanyReviewCardProps {
  review: CompanyReviewCardItem;
  /** "full"(기본) = [companyId]/reviews·interviews 전용 탭 카드. "compact" = 개요 미리보기용 축소 변형 —
   * 패딩·타이포를 반 단계 줄이고, 저장 버튼을 생략하고, 도움돼요는 토글 없이 숫자만 보여주며, 면접 유형/난이도
   * 배지와 지원 시기 한 줄은 그리지 않는다. 면접 후기 본문은 compact에서도 절대 노출하지 않는다(열람권 게이팅
   * 정합 — 잠금 CTA조차 띄우지 않고 그 자리를 그냥 비운다. 기존 개요 미리보기 동작과 동일). */
  variant?: "full" | "compact";
  lockedMessage?: string;
  lockedCtaLabel?: string;
  lockedCtaHref?: string;
  lockedCtaVariant?: "outline" | "gradient";
  onLockedCtaClick?: () => void;
  /** 면접 후기 열람권 게이팅 — 지정되면 review.content 값과 무관하게 이 상태로 잠금 여부를 결정한다.
   * 미지정 시(기본) 기존처럼 review.content === null 여부로만 잠금을 판단한다. */
  interviewAccess?: CompanyReviewInterviewAccess;
  /** 잠기지 않은 본문 위에 그리는 보조 라벨(예: "열람 완료 · 추가 차감 없음", "내가 작성한 후기"). */
  accessLabel?: string;
}

function getInterviewAccessCopy(access: CompanyReviewInterviewAccess) {
  switch (access.status) {
    case "loggedOut":
      return {
        message: "로그인 후 열람 가능",
        secondaryMessage: "가입 시 열람권 2장 지급",
        ctaLabel: "무료 열람권 받고 보기",
        ctaHref: "#" as string | undefined,
        onCtaClick: undefined as (() => void) | undefined,
        ctaVariant: "outline" as const,
      };
    case "noCredits":
      return {
        message: "보유 열람권 0장",
        secondaryMessage: "후기 작성 시 2장 지급",
        ctaLabel: "후기 작성하고 열람권 받기",
        ctaHref: access.writeHref as string | undefined,
        onCtaClick: undefined as (() => void) | undefined,
        ctaVariant: "outline" as const,
      };
    case "canUnlock":
      return {
        message: "열람권 1장으로 보기",
        secondaryMessage: `보유 ${access.credits}장`,
        ctaLabel: "1장 사용하고 보기",
        ctaHref: undefined as string | undefined,
        onCtaClick: access.onUnlockRequest as (() => void) | undefined,
        ctaVariant: "solid" as const,
      };
  }
}

/** [companyId]/reviews, [companyId]/interviews 전용 페이지(variant="full")와 개요 미리보기(variant="compact")가
 * 공유하는 단일 카드. 원문 게이팅 대상(면접 후기)만 content가 null로 내려오며, full에서는 그 경우 태그·메타는
 * 그대로 두고 원문 영역만 잠그고(LockedContent), compact에서는 애초에 면접 후기 본문 영역 자체를 렌더하지 않는다. */
export function CompanyReviewCard({
  review,
  variant = "full",
  lockedMessage,
  lockedCtaLabel,
  lockedCtaHref,
  lockedCtaVariant,
  onLockedCtaClick,
  interviewAccess,
  accessLabel,
}: CompanyReviewCardProps) {
  const compact = variant === "compact";
  const locked = interviewAccess ? true : review.content === null;
  const interviewAccessCopy = interviewAccess ? getInterviewAccessCopy(interviewAccess) : null;
  const [helpful, setHelpful] = useState({ active: false, count: review.helpfulCount });
  const [saved, setSaved] = useState(false);
  const interviewMeta = [review.interviewDifficulty ? `난이도 ${review.interviewDifficulty}` : null, review.interviewFormat ?? null]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  const applyLabel =
    review.applyYear && review.applyHalf ? `${review.applyYear}년 ${review.applyHalf} ${review.isInterview ? "면접" : "지원"}` : null;

  return (
    <article className={clsx("border border-border bg-white", compact ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
        <span className={clsx("min-w-0 truncate font-medium text-[#3f4855]", compact ? "text-[12px]" : "text-[13px]")}>
          {review.jobRole} · {review.authorStatus}
        </span>
        {/* 작성일·도움돼요·스크랩은 메타라 두 변형 모두 12px — 기준표 하한이 12여서 compact를 더 줄이지 않는다 */}
        <div className="flex shrink-0 items-center gap-3 text-[12px] font-normal text-[#9aa5b2]">
          <span>{review.writtenAt}</span>
          {compact ? (
            <span className="inline-flex items-center gap-1 text-[#596373]">
              <ThumbsUp size={14} />
              {review.helpfulCount}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setHelpful((prev) => ({ active: !prev.active, count: prev.count + (prev.active ? -1 : 1) }))}
              aria-pressed={helpful.active}
              className={clsx("inline-flex items-center gap-1 font-normal transition", helpful.active ? "text-[#111111]" : "text-[#596373] hover:text-[#111111]")}
            >
              <ThumbsUp size={16} />
              {helpful.count}
            </button>
          )}
          {!compact ? (
            <button
              type="button"
              onClick={() => setSaved((prev) => !prev)}
              aria-pressed={saved}
              aria-label={saved ? "후기 스크랩 해제" : "후기 스크랩"}
              className={clsx("inline-flex items-center gap-1 font-normal transition", saved ? "text-[#111111]" : "text-[#596373] hover:text-[#111111]")}
            >
              <Bookmark size={16} className={saved ? "fill-current" : undefined} />
            </button>
          ) : null}
        </div>
      </div>
      <div className={clsx("flex flex-wrap gap-1.5", compact ? "mt-2" : "mt-3")}>
        {review.tags.map((tag) => (
          <span
            key={tag}
            className={clsx("bg-[#f4f6f8] font-medium text-[#596373]", compact ? "px-1.5 py-0.5 text-[12px]" : "px-2 py-1 text-[13px]")}
          >
            {tag}
          </span>
        ))}
      </div>
      {!compact && interviewMeta ? (
        <div className="mt-2">
          <span className="inline-block border border-[#d9d9d9] bg-white px-2 py-1 text-[13px] font-medium text-[#3f4855]">{interviewMeta}</span>
        </div>
      ) : null}
      {compact ? (
        !review.isInterview && review.content ? (
          <p className="mt-2 flex gap-1.5 text-[12px] leading-[1.6] text-[#596373]">
            <Quote size={12} className="mt-0.5 shrink-0 rotate-180 text-[#9aa5b2]" aria-hidden />
            <span className="line-clamp-2">{review.content}</span>
          </p>
        ) : null
      ) : locked ? (
        interviewAccessCopy ? (
          <LockedContent
            className="mt-3"
            lines={3}
            roomy
            message={interviewAccessCopy.message}
            secondaryMessage={interviewAccessCopy.secondaryMessage}
            ctaLabel={interviewAccessCopy.ctaLabel}
            ctaHref={interviewAccessCopy.ctaHref}
            onCtaClick={interviewAccessCopy.onCtaClick}
            ctaVariant={interviewAccessCopy.ctaVariant}
          />
        ) : (
          <LockedContent
            className="mt-3"
            lines={3}
            message={lockedMessage ?? ""}
            ctaLabel={lockedCtaLabel ?? ""}
            ctaHref={lockedCtaHref}
            ctaVariant={lockedCtaVariant}
            onCtaClick={onLockedCtaClick}
          />
        )
      ) : (
        <>
          {accessLabel ? <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">{accessLabel}</p> : null}
          <p className={clsx("flex gap-1.5 text-[13px] font-normal leading-[1.7] text-[#3f4855]", accessLabel ? "mt-1.5" : "mt-3")}>
            <Quote size={14} className="mt-0.5 shrink-0 rotate-180 text-[#9aa5b2]" aria-hidden />
            <span>{review.content}</span>
          </p>
        </>
      )}
      {!compact && applyLabel ? <p className="mt-2 text-[12px] font-normal text-[#9aa5b2]">{applyLabel}</p> : null}
      {review.outcome ? (
        <div className={clsx("flex justify-end border-t border-[#edf1f5]", compact ? "mt-2 pt-2" : "mt-3 pt-3")}>
          <span
            className={clsx(
              "border",
              "font-medium",
              compact ? "px-1.5 py-0.5 text-[12px]" : "px-2 py-0.5 text-[13px]",
              // 합격/불합격은 굵기가 아니라 보더·글자색으로만 구분한다(배지 굵기는 500 고정)
              review.outcome === "합격" ? "border-[#111111] text-[#111111]" : "border-[#d9d9d9] text-[#777777]",
            )}
          >
            {review.outcome}
          </span>
        </div>
      ) : null}
    </article>
  );
}
