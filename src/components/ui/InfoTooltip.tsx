"use client";

import clsx from "clsx";

interface InfoTooltipProps {
  /** 툴팁 상단에 굵게 표시할 제목. 미지정 시 제목 없이 불릿 목록만 렌더한다. (대형 모드) */
  title?: string;
  /** 안내문을 줄 단위 배열로 받는다 — 각 항목이 불릿과 함께 한 줄로 렌더된다. (대형 모드) */
  lines?: string[];
  /** 단문 안내. 지정 시 소형 패널로 렌더된다 — title/lines와 함께 쓰지 않는다. (소형 모드) */
  text?: string;
  /**
   * 패널 펼침 방향. 기본 "top"(트리거 위). 트리거가 overflow 클리핑 컨테이너의 상단 가장자리에
   * 있어 위로 펼치면 잘리는 경우에만 "bottom"으로 지정한다 (예: 지원자 관리 테이블 헤더).
   */
  placement?: "top" | "bottom";
  className?: string;
}

/**
 * 플랫폼 공용 (i) 툴팁. hover/focus 시에만 표시되는 순수 CSS 경로다(클릭 토글 없음).
 * 두 가지 모드:
 *  - 대형: title(선택) + lines[] 불릿 — 여러 줄 정책 안내 (열람권 이용 안내 등)
 *  - 소형: text — 한 줄 용어/규칙 설명 (인증 정보, 적합도 산정 등)
 * 이전에 별도로 있던 BusinessFormControls의 CSS-only InfoTooltip을 이 컴포넌트로 흡수했다.
 */
export function InfoTooltip({ title, lines, text, placement = "top", className }: InfoTooltipProps) {
  const isCompact = text != null;

  return (
    <span className={clsx("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label="안내 보기"
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center text-[12px] font-normal leading-none text-[#9aa3af] outline-none transition hover:text-[#4f5967] focus-visible:text-[#4f5967]"
      >
        ⓘ
      </button>
      <span
        role="tooltip"
        className={clsx(
          // 트리거·다크 배경·모바일 클램프·전환은 두 모드 공통. hover/focus로만 노출.
          // 툴팁은 떠 있는 오버레이 — 그림자 기능 예외 (no-shadow 원칙 예외).
          "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 border border-[#17202c] bg-[#17202c] text-left font-normal text-white opacity-0 shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          isCompact
            ? "w-max max-w-[240px] px-3 py-2 text-[12px] leading-[1.5]"
            : "w-[340px] max-w-[calc(100vw-32px)] px-4 py-4 text-[13px] leading-[1.6]",
        )}
      >
        {isCompact ? (
          text
        ) : (
          <>
            {title ? <span className="mb-2 block font-semibold">{title}</span> : null}
            <span className="block space-y-1">
              {(lines ?? []).map((line, index) => (
                <span key={index} className="flex gap-1.5">
                  <span aria-hidden="true">•</span>
                  <span>{line}</span>
                </span>
              ))}
            </span>
          </>
        )}
      </span>
    </span>
  );
}
