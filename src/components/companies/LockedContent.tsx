"use client";

import clsx from "clsx";
import { Lock } from "lucide-react";
import Link from "next/link";

interface LockedContentProps {
  message: string;
  /** message 아래에 보조 설명 한 줄을 더 그린다(예: "보유 2장"). 미지정 시 기존과 동일하게 한 줄만 렌더한다. */
  secondaryMessage?: string;
  ctaLabel: string;
  /** 실제 라우트로 이동해야 할 때 사용(예: 로그인 상태 복구). */
  ctaHref?: string;
  /** 아직 연결할 실제 화면이 없을 때 사용하는 임시 핸들러. */
  onCtaClick?: () => void;
  /** 잠금 영역의 스켈레톤 줄 수. 맥락(카드/본문)에 맞게 조정한다. */
  lines?: number;
  className?: string;
  /** 기본은 모노톤 아웃라인 버튼. "gradient"는 페이지당 대표 액션 하나(예: 면접 후기 작성하기)에만 사용할 것 —
   * "solid"는 즉시 실행 가능한 단일 액션(예: 열람권으로 바로 열람)에만 사용한다. 미지정 시 기존 동작과 동일하다. */
  ctaVariant?: "outline" | "gradient" | "solid";
  /** 상하 여백/요소 간격을 한 단계 넓힌 변형. 미지정 시 기존 레이아웃과 동일하다. */
  roomy?: boolean;
}

/**
 * 기업 리뷰·면접 후기가 공유하는 잠금 UI. 실제 원문은 서버에서부터 이 컴포넌트에 전달되지
 * 않으므로(부모가 잠금 여부에 따라 콘텐츠 자체를 보내지 않음), 흐릿한 텍스트 대신 항상
 * 스켈레톤 placeholder + 흰색 gradient + 자물쇠 아이콘 + 안내문 + CTA만 렌더링한다.
 */
export function LockedContent({
  message,
  secondaryMessage,
  ctaLabel,
  ctaHref,
  onCtaClick,
  lines = 3,
  className,
  ctaVariant = "outline",
  roomy = false,
}: LockedContentProps) {
  const ctaClassName =
    ctaVariant === "gradient"
      ? "mt-1 inline-flex h-9 items-center px-4 text-[13px] font-medium text-white transition hover:brightness-110 active:brightness-90"
      : ctaVariant === "solid"
        ? "mt-1 inline-flex h-9 items-center bg-[#111111] px-4 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a]"
        : "mt-1 inline-flex h-9 items-center border border-[#111111] px-4 text-[13px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white";
  const ctaStyle =
    ctaVariant === "gradient" ? { backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 3px rgba(5,60,55,0.28)" } : undefined;

  return (
    <div
      role="region"
      aria-label="잠긴 콘텐츠"
      className={clsx(
        "relative overflow-hidden border border-border bg-white",
        // roomy의 min-h-[210px]는 "하한"으로만 쓴다 — 콘텐츠 층을 흐름(static)에 두고 컨테이너가 flex로 세로
        // 중앙 정렬하므로, 글씨가 커져 내부 높이가 208px(=210 − 보더 2)를 넘기면 컨테이너가 함께 늘어난다.
        // 예전에는 콘텐츠가 absolute inset-0이라 210px에 갇혀 위아래가 잘렸다. roomy=false 경로는 원래부터
        // 흐름 기반이었어서 이제 두 변형이 같은 구조(배경만 absolute, 콘텐츠는 흐름)를 공유한다.
        roomy && "flex min-h-[210px] flex-col justify-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={clsx("px-4", roomy ? "absolute inset-x-0 top-0 space-y-2.5 pt-5" : "space-y-2 pt-4")}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 bg-[#eceff2]"
            style={{ width: index === lines - 1 ? "55%" : "100%" }}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.82)_50%,rgba(255,255,255,0.98)_78%)]"
      />
      <div
        className={clsx(
          "relative z-10 flex flex-col items-center px-4 text-center",
          roomy ? "gap-2.5" : "gap-2 pb-5 pt-9",
        )}
      >
        <Lock size={17} className="text-[#8a95a5]" aria-hidden="true" />
        <p className="max-w-[260px] text-[15px] font-medium leading-[1.5] text-[#4f5967]">{message}</p>
        {secondaryMessage ? <p className="max-w-[260px] text-[12px] font-normal leading-[1.5] text-[#9aa3af]">{secondaryMessage}</p> : null}
        {ctaHref ? (
          <Link href={ctaHref} className={ctaClassName} style={ctaStyle}>
            {ctaLabel}
          </Link>
        ) : (
          <button type="button" onClick={onCtaClick} className={ctaClassName} style={ctaStyle}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
