"use client";

import { useState } from "react";
import clsx from "clsx";

interface InfoTooltipProps {
  /** 툴팁 상단에 굵게 표시할 제목. 미지정 시 제목 없이 불릿 목록만 렌더한다. */
  title?: string;
  /** 안내문을 줄 단위 배열로 받는다 — 각 항목이 불릿과 함께 한 줄로 렌더된다. */
  lines: string[];
  className?: string;
}

/**
 * 여러 줄 안내가 필요한 곳에서 쓰는 (i) 툴팁. business/BusinessFormControls의 InfoTooltip과는
 * 별개 구현이다 — hover뿐 아니라 클릭(터치 환경)으로도 토글되어야 해서 로컬 open 상태를 갖는다.
 */
export function InfoTooltip({ title, lines, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={clsx("group relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
        aria-label="안내 보기"
        aria-expanded={open}
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center text-[12px] font-normal leading-none text-[#9aa3af] outline-none transition hover:text-[#4f5967] focus-visible:text-[#4f5967]"
      >
        ⓘ
      </button>
      <span
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[340px] max-w-[calc(100vw-32px)] -translate-x-1/2 border border-[#17202c] bg-[#17202c] px-4 py-4 text-left text-[13px] font-normal leading-[1.6] text-white opacity-0 shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          open && "opacity-100",
        )}
      >
        {title ? <span className="mb-2 block font-semibold">{title}</span> : null}
        <span className="block space-y-1">
          {lines.map((line, index) => (
            <span key={index} className="flex gap-1.5">
              <span aria-hidden="true">•</span>
              <span>{line}</span>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
