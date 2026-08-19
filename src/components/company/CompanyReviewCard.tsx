"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bookmark, Quote, Star, ThumbsUp } from "lucide-react";
import { LockedContent } from "@/components/companies/LockedContent";
import type { PharmacyReviewRating } from "@/config/pharmacyReviewForm";

/**
 * 약국 재직 후기의 구조화 표시값. 선택지 id는 이미 문구로 바뀐 뒤라 이 카드는 문항 정의를 알지 못한다
 * (되돌리는 일은 companyReviewItems의 매핑이 한다).
 *
 * meta와 rating은 잠금 위, narratives·highlights는 잠금 아래에 선다 — 어떤 자리에서 얼마나 일했고
 * 몇 점을 줬는지는 열지 않아도 보이고, 왜 그런지가 열람 대상이다.
 */
export interface PharmacyReviewDisplay {
  rating?: PharmacyReviewRating;
  /** "정규직(풀타임) · 1~3년 · 2024년" */
  meta: string;
  /** 좋았던 점 / 아쉬웠던 점. 값이 없는 블록은 애초에 들어오지 않는다 */
  narratives: Array<{ label: string; text: string }>;
  /** 카드에 펼치는 항목별 답변(업무 강도·퇴근시간·재근무 의향) */
  highlights: Array<{ label: string; value: string }>;
}

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
  /** 약국 재직 후기에만 존재. 값이 있으면 본문이 원문 한 덩어리가 아니라 구조화 블록으로 그려진다 */
  pharmacy?: PharmacyReviewDisplay;
  /**
   * 비공개·삭제된 후기의 자리표시 문구(REVIEW_HIDDEN_NOTICE). 값이 있으면 본문 대신 이 한 줄만 그린다.
   * 잠금보다 먼저 판정한다 — 내려갈 내용이 아예 없는 후기에 "열람권 1장으로 보기"를 붙이면
   * 열고 나서야 빈 것을 알게 된다.
   */
  hiddenNotice?: string;
  /**
   * 약국이 이 후기에 남긴 공식 답변. 잠긴 카드에서는 그리지 않는다(아래 렌더 위치가 잠금 안쪽이다) —
   * 본문이 가려졌는데 답변만 보이면 답변이 무엇에 대한 반박인지로 원문이 유추된다.
   */
  officialReply?: { content: string; writtenAt: string };
}

/** 열람권(credit) 게이팅 상태. 값이 있으면 review.content 유무와 무관하게 이 상태에 따라 본문을 잠근다.
 *
 * 면접 후기 목록(CompanyInterviewsListClient)과 약국 재직 후기 목록(PharmacyReviewsListClient)이 전달하고,
 * 그 외 사용처는 undefined다. 문구는 두 후기 종류가 그대로 공유한다 — 아래 getInterviewAccessCopy가
 * 처음부터 "후기"라고만 말하고 있어 갈라 둘 이유가 없다. 다른 것은 writeHref가 가리키는 작성 폼뿐이다.
 * (이름에 Interview가 남은 것은 면접 후기 쪽 호출부를 건드리지 않기 위해서다.) */
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
  /** 열람권 게이팅(면접 후기·약국 재직 후기) — 지정되면 review.content 값과 무관하게 이 상태로 잠금 여부를
   * 결정한다. 미지정 시(기본) 기존처럼 review.content === null 여부로만 잠금을 판단한다.
   * 약국 재직 후기에서는 별점·근무 메타·태그가 잠금 위에 남고 서술 두 블록과 항목별 답변만 가려진다. */
  interviewAccess?: CompanyReviewInterviewAccess;
  /** 잠기지 않은 본문 위에 그리는 보조 라벨(예: "열람 완료 · 추가 차감 없음", "내가 작성한 후기"). */
  accessLabel?: string;
  /**
   * 카드 자신의 테두리·배경·패딩을 벗는다. 기업센터 후기 관리처럼 이미 흰 블록 안에 놓일 때만 쓴다 —
   * 그대로 넣으면 1px 액자가 겹쳐 프레임 안의 프레임이 된다. 안쪽 내용은 그대로다.
   */
  frameless?: boolean;
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

/**
 * 종합 평가 별점(읽기 전용). 작성 폼의 별점(PharmacyReviewFormSections)과 같은 두 색을 쓴다 —
 * 채운 별은 본문 검정(#111111), 빈 별은 채운 회색(#e6e9ee). 빈 별을 외곽선으로 두면 다섯 칸이
 * 서로 다른 굵기로 읽혀 몇 점인지가 한눈에 들어오지 않는다.
 */
function ReviewRatingStars({ value, size }: { value: PharmacyReviewRating; size: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`5점 만점에 ${value}점`}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          size={size}
          className={score <= value ? "fill-[#111111] text-[#111111]" : "fill-[#e6e9ee] text-[#e6e9ee]"}
          aria-hidden
        />
      ))}
    </span>
  );
}

/**
 * 약국 재직 후기 본문의 블록 경계. 구분선 위아래가 같은 16px이라 선이 어느 블록에 딸린 것인지가
 * 생기지 않는다 — 종전에는 항목별 답변만 12px 위·12px 아래였고 그 위 서술 블록은 여백이 달라,
 * 같은 카드 안에서 두 개의 리듬이 겹쳤다. 여백은 전부 py 축으로만 준다(마진과 섞지 않는다).
 */
const PHARMACY_BLOCK_CLASS = "mt-4 border-t border-border pt-4";

/**
 * 약국 재직 후기의 본문 — 열람 상태 행 + 서술 두 블록 + 항목별 답변 3행. 잠금이 걸리면 이 덩어리째
 * LockedContent로 바뀐다.
 *
 * 열람 상태 행이 여기로 들어온 것은 그것이 후기의 메타가 아니라 **본문의 상태**라서다. 태그 아래
 * 12px 회색 한 줄로 떠 있을 때는 작성일·직무와 같은 층으로 읽혀, 무엇이 열려 있다는 말인지가
 * 본문과 이어지지 않았다. 구분선 위에 세우면 그 아래가 열린 내용이라는 것이 자리로 드러난다.
 */
function PharmacyReviewBody({ pharmacy, accessLabel }: { pharmacy: PharmacyReviewDisplay; accessLabel?: string }) {
  return (
    <div className="mt-3">
      {accessLabel ? (
        /* 점 문법은 기업센터 상태 행(BusinessReviewsClient의 StatusText)과 같은 한 줄이다 —
           statusTone.ts의 3단 원칙에서 초록 = 완료. 열람이 끝난 상태라 진행 중(파랑)이 아니다. */
        <p className="flex items-center gap-[8px] pb-4 text-[13px] font-medium text-status-positive">
          <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-positive-dot" aria-hidden />
          {accessLabel}
        </p>
      ) : null}
      {/* 서술 두 블록. 라벨은 회색 한 색뿐이다 — 좋았던 점·아쉬웠던 점에 색을 주면 카드가 후기를
          읽기도 전에 평가해 버린다(별점이 이미 그 일을 한다). 구분선은 위에 상태 행이 있을 때만
          긋는다: 없으면 태그 행이 바로 위라 선이 한 줄 더 생기는 것에 지나지 않는다. */}
      <div className={clsx("grid gap-4", accessLabel && "border-t border-border pt-4")}>
        {pharmacy.narratives.map((block) => (
          <div key={block.label}>
            <p className="text-[13px] font-medium text-[#6b7280]">{block.label}</p>
            <p className="mt-1.5 text-[15px] font-normal leading-[1.7] text-[#3f4855]">{block.text}</p>
          </div>
        ))}
      </div>
      {pharmacy.highlights.length ? (
        /* 라벨 열 + 값 열. 가운뎃점으로 이으면 세 항목이 한 문장으로 읽혀 어디까지가 라벨인지 흐려진다 —
           위 메타 행(근무 형태·기간·시기)이 이미 그 문법을 쓰고 있어 두 줄이 같은 것으로 보이기도 한다.
           값은 본문 검정 일반 텍스트다: 여기가 이 후기에서 비교 대상이 되는 답이라 서술(#3f4855)보다
           앞에 서야 하고, 그 일을 굵기나 배경이 아니라 색 한 단계로만 한다. */
        <div className={clsx("grid gap-2", PHARMACY_BLOCK_CLASS)}>
          {pharmacy.highlights.map((row) => (
            <div key={row.label} className="flex gap-2 leading-[1.5]">
              <span className="w-[70px] shrink-0 text-[13px] font-normal text-[#8a95a5]">{row.label}</span>
              <span className="min-w-0 text-[14px] font-normal text-[#111111]">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
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
  frameless = false,
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
    <article className={clsx(!frameless && "border border-border bg-white", !frameless && (compact ? "p-3" : "p-4"))}>
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
      {/* 별점 + 근무 형태·기간·시기. 잠금 대상이 아니라 헤더 바로 아래, 태그 위에 선다 */}
      {review.pharmacy ? (
        <div className={clsx("flex flex-wrap items-center gap-x-2 gap-y-1", compact ? "mt-1.5" : "mt-2")}>
          {review.pharmacy.rating ? <ReviewRatingStars value={review.pharmacy.rating} size={compact ? 13 : 15} /> : null}
          {review.pharmacy.meta ? (
            <span className={clsx("font-normal text-[#7a838f]", compact ? "text-[12px]" : "text-[13px]")}>{review.pharmacy.meta}</span>
          ) : null}
        </div>
      ) : null}
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
      {review.hiddenNotice ? (
        /* 자리표시 — 태그·별점이 없는 후기라 이 한 줄이 카드 본문의 전부다.
           LockedContent와 달리 CTA가 없다: 열 수 있는 것이 남아 있지 않다. */
        <p
          className={clsx(
            "border border-border bg-[#f7f8fa] px-4 text-center font-normal leading-[1.6] text-[#8a95a5]",
            compact ? "mt-2 py-3 text-[12px]" : "mt-3 py-5 text-[13px]",
          )}
        >
          {review.hiddenNotice}
        </p>
      ) : compact ? (
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
          {/* 약국 재직 후기는 열람 상태 행까지 본문 쪽이 든다(PharmacyReviewBody 주석). 나머지 후기는
              종전 그대로 — 본문이 원문 한 덩어리라 상태 행을 그 위에 얹는 것 말고 둘 자리가 없다. */}
          {review.pharmacy ? (
            <PharmacyReviewBody pharmacy={review.pharmacy} accessLabel={accessLabel} />
          ) : (
            <>
              {accessLabel ? <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">{accessLabel}</p> : null}
              <p className={clsx("flex gap-1.5 text-[13px] font-normal leading-[1.7] text-[#3f4855]", accessLabel ? "mt-1.5" : "mt-3")}>
                <Quote size={14} className="mt-0.5 shrink-0 rotate-180 text-[#9aa5b2]" aria-hidden />
                <span>{review.content}</span>
              </p>
            </>
          )}
          {review.officialReply ? (
            /* 회색 판 위에 얹어 후기 본문과 목소리를 가른다 — 같은 카드 안이지만 쓴 사람이 다르다.
               잠금 분기 안쪽이라 잠긴 카드에서는 이 블록 자체가 렌더되지 않는다. */
            <div className="mt-4 border-l-2 border-[#d8dee6] bg-[#f7f8fa] px-4 py-3">
              <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] font-medium text-[#3f4855]">
                약국 공식 답변
                <span className="text-[12px] font-normal text-[#9aa5b2]">{review.officialReply.writtenAt}</span>
              </p>
              <p className="mt-1.5 text-[13px] font-normal leading-[1.7] text-[#4f5967]">{review.officialReply.content}</p>
            </div>
          ) : null}
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
