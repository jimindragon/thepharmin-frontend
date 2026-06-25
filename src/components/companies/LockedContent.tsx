"use client";

import clsx from "clsx";
import { Lock } from "lucide-react";
import Link from "next/link";

interface LockedContentProps {
  message: string;
  ctaLabel: string;
  /** 실제 라우트로 이동해야 할 때 사용(예: 로그인 상태 복구). */
  ctaHref?: string;
  /** 아직 연결할 실제 화면이 없을 때 사용하는 임시 핸들러. */
  onCtaClick?: () => void;
  /** 잠금 영역의 스켈레톤 줄 수. 맥락(카드/본문)에 맞게 조정한다. */
  lines?: number;
  className?: string;
}

/**
 * 기업 리뷰·면접 후기가 공유하는 잠금 UI. 실제 원문은 서버에서부터 이 컴포넌트에 전달되지
 * 않으므로(부모가 잠금 여부에 따라 콘텐츠 자체를 보내지 않음), 흐릿한 텍스트 대신 항상
 * 스켈레톤 placeholder + 흰색 gradient + 자물쇠 아이콘 + 안내문 + CTA만 렌더링한다.
 */
export function LockedContent({ message, ctaLabel, ctaHref, onCtaClick, lines = 3, className }: LockedContentProps) {
  return (
    <div
      role="region"
      aria-label="잠긴 콘텐츠"
      className={clsx("relative overflow-hidden border border-[#e5e9ef] bg-white", className)}
    >
      <div aria-hidden="true" className="space-y-2 px-4 pt-4">
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
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 pb-5 pt-9 text-center">
        <Lock size={17} className="text-[#8a95a5]" aria-hidden="true" />
        <p className="max-w-[260px] text-[13px] font-medium leading-[1.5] text-[#4f5967]">{message}</p>
        {ctaHref ? (
          <Link
            href={ctaHref}
            className="mt-1 inline-flex h-9 items-center border border-[#111111] px-4 text-[12px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCtaClick}
            className="mt-1 inline-flex h-9 items-center border border-[#111111] px-4 text-[12px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
