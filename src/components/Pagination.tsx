"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  /** 전체 페이지 수. 소비처가 (전체 항목 수 / 페이지당 개수)로 계산해 넘긴다 */
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 목록의 성격에 맞는 안내 문구. 공고 외 목록(기업·후보자 등)에서는 반드시 덮어쓸 것 */
  ariaLabel?: string;
}

/** 한 칸은 페이지 숫자이거나, 접힌 구간을 뜻하는 "…"이다 */
type PageSlot = number | "ellipsis";

/**
 * 한 줄에 놓을 수 있는 칸 수 상한.
 * ≤760px에서 컨테이너(.app-shell)는 390px 화면 기준 342px인데, 46px 칸 5개 + "다음"(≈82px) = 312px라 들어가고
 * 6칸이 되는 순간 347px이라 넘친다. 아래 윈도잉은 어떤 (currentPage, totalPages)에서도 이 값을 넘기지 않는다.
 */
const MAX_SLOTS = 5;

/**
 * 첫·마지막·현재±radius만 남기고 사이를 접는다.
 * 접힌 구간이 한 페이지뿐이면 "…"가 그 숫자와 같은 46px을 먹으면서 이동은 못 하므로, 숫자를 그대로 남긴다.
 */
function buildSlots(currentPage: number, totalPages: number, radius: number): PageSlot[] {
  const kept = new Set<number>([1, totalPages]);
  for (let page = currentPage - radius; page <= currentPage + radius; page += 1) {
    if (page >= 1 && page <= totalPages) kept.add(page);
  }

  const sorted = [...kept].sort((a, b) => a - b);
  const slots: PageSlot[] = [];

  sorted.forEach((page, index) => {
    if (index > 0) {
      const gap = page - sorted[index - 1];
      if (gap === 2) slots.push(page - 1);
      else if (gap > 2) slots.push("ellipsis");
    }
    slots.push(page);
  });

  return slots;
}

function getPageSlots(currentPage: number, totalPages: number): PageSlot[] {
  // 상한 이하면 접을 이유가 없다 — 전량 표시가 이동 거리도 짧다.
  if (totalPages <= MAX_SLOTS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // 현재±1 창이 상한을 넘기는 경우(양쪽에 "…"가 다 뜨거나, 간극이 숫자로 메워져 6칸이 되는 경우)
  // 창을 현재 페이지 하나로 좁힌다. radius 0은 남는 페이지가 최대 3개(1·현재·마지막) + 간극 2개라 항상 5칸 이하다.
  const windowed = buildSlots(currentPage, totalPages, 1);
  return windowed.length <= MAX_SLOTS ? windowed : buildSlots(currentPage, totalPages, 0);
}

/**
 * 숫자 칸과 "…" 칸이 같은 격자에 놓이도록 크기·테두리 문법을 공유한다.
 * 각 칸의 우측 테두리는 다음 칸이 이어 그리고, 줄 끝은 "다음" 버튼의 좌측 테두리가 닫는다.
 */
const SLOT_CLASS = "h-[40px] w-[46px] border border-r-0 border-[#dce2ea] text-[13px] font-medium";

export function Pagination({ currentPage, totalPages, onPageChange, ariaLabel = "공고 목록 페이지" }: PaginationProps) {
  // 페이지가 하나뿐이면 누를 곳이 없으므로 아예 렌더하지 않는다 — 빈 페이지로 가는 버튼이 남지 않게.
  if (totalPages <= 1) return null;

  const slots = getPageSlots(currentPage, totalPages);
  const isLastPage = currentPage >= totalPages;

  return (
    <nav className="mt-8 flex justify-center" aria-label={ariaLabel}>
      <div className="flex h-[40px] items-center">
        {slots.map((slot, index) =>
          slot === "ellipsis" ? (
            // 접힌 구간 표시일 뿐 갈 곳이 정해지지 않은 칸이라 버튼으로 만들지 않는다(포커스·클릭 대상 아님).
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className={clsx(SLOT_CLASS, "flex items-center justify-center bg-white text-[#9ca3af]")}
            >
              …
            </span>
          ) : (
            <button
              key={slot}
              type="button"
              onClick={() => onPageChange(slot)}
              aria-current={currentPage === slot ? "page" : undefined}
              className={clsx(
                SLOT_CLASS,
                currentPage === slot ? "bg-[#111111] text-white" : "bg-white text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand",
              )}
            >
              {slot}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={isLastPage}
          className={clsx(
            "flex h-[40px] items-center gap-2 border border-[#dce2ea] bg-white px-4 text-[13px] font-medium",
            isLastPage ? "cursor-default text-[#c3c9d2]" : "text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand",
          )}
        >
          다음
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
