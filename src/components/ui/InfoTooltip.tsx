"use client";

import { useState } from "react";
import clsx from "clsx";

interface InfoTooltipProps {
  /** 안내문을 줄 단위 배열로 받는다 — 각 항목이 한 줄로 렌더된다. */
  lines: string[];
  className?: string;
}

/**
 * 여러 줄 안내가 필요한 곳에서 쓰는 (i) 툴팁. business/BusinessFormControls의 InfoTooltip과는
 * 별개 구현이다 — hover뿐 아니라 클릭(터치 환경)으로도 토글되어야 해서 로컬 open 상태를 갖는다.
 */
export function InfoTooltip({ lines, className }: InfoTooltipProps) {
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
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[260px] -translate-x-1/2 space-y-1 border border-[#17202c] bg-[#17202c] px-3 py-2 text-[11.5px] font-normal leading-[1.5] text-white opacity-0 shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          open && "opacity-100",
        )}
      >
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}
