"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
 * 한 줄에 놓을 수 있는 페이지 칸 수 상한.
 * ≤760px에서 컨테이너(.app-shell)는 390px 화면 기준 342px, 360px 화면 기준 312px이다.
 * 그 폭에서는 칸도 이전·다음도 40px 정사각으로 접으므로 한 줄은 (5 + 2) × 40 = 280px으로 들어가고,
 * 6칸이 되면 320px이라 360px 화면에서 넘친다. 아래 윈도잉은 어떤 (currentPage, totalPages)에서도 이 값을 넘기지 않는다.
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
 * 각 칸의 우측 테두리는 다음 칸이 이어 그리고, 줄 끝은 "다음" 버튼의 우측 테두리가 닫는다.
 */
const SLOT_CLASS =
  "h-[40px] w-[46px] border border-r-0 border-[#dce2ea] text-[13px] font-medium max-[760px]:w-[40px]";

/**
 * 이전·다음 공통. 데스크톱은 셰브론 + 라벨이지만 ≤760px에서는 라벨을 접고 40×40 정사각으로 줄인다
 * — 라벨을 그대로 두면 두 버튼만 165px을 먹어 5칸 + 이전·다음이 360px 화면 컨테이너(312px)를 넘는다.
 * 폭을 줄여도 40×40이라 터치 타겟 하한은 유지된다.
 */
const STEP_CLASS =
  "flex h-[40px] items-center gap-2 border border-[#dce2ea] bg-white px-4 text-[13px] font-medium max-[760px]:w-[40px] max-[760px]:justify-center max-[760px]:px-0";

/** 이전·다음의 활성/비활성 색. 비활성은 테두리를 남기고 글자만 죽인다(그라데이션·브랜드색 금지) */
function stepTone(disabled: boolean) {
  return disabled ? "cursor-default text-[#c3c9d2]" : "text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand";
}

export function Pagination({ currentPage, totalPages, onPageChange, ariaLabel = "공고 목록 페이지" }: PaginationProps) {
  // 페이지가 하나뿐이면 누를 곳이 없으므로 아예 렌더하지 않는다 — 빈 페이지로 가는 버튼이 남지 않게.
  if (totalPages <= 1) return null;

  const slots = getPageSlots(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav className="mt-8 flex justify-center" aria-label={ariaLabel}>
      <div className="flex h-[40px] items-center">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={isFirstPage}
          // ≤760px에서 라벨이 접히므로 이름은 aria-label로 고정한다. 보이는 "이전"을 포함해 음성 조작과도 어긋나지 않는다.
          aria-label="이전 페이지"
          className={clsx(STEP_CLASS, "border-r-0", stepTone(isFirstPage))}
        >
          <ChevronLeft size={18} />
          <span className="max-[760px]:hidden">이전</span>
        </button>
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
          aria-label="다음 페이지"
          className={clsx(STEP_CLASS, stepTone(isLastPage))}
        >
          <span className="max-[760px]:hidden">다음</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
