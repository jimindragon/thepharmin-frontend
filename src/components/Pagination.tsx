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

export function Pagination({ currentPage, totalPages, onPageChange, ariaLabel = "공고 목록 페이지" }: PaginationProps) {
  // 페이지가 하나뿐이면 누를 곳이 없으므로 아예 렌더하지 않는다 — 빈 페이지로 가는 버튼이 남지 않게.
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-8 flex justify-center" aria-label={ariaLabel}>
      <div className="flex h-[38px] items-center">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={clsx(
              "h-[38px] w-[46px] border border-r-0 border-[#dce2ea] text-[13px] font-medium",
              currentPage === page ? "bg-[#111111] text-white" : "bg-white text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="flex h-[38px] items-center gap-2 border border-[#dce2ea] bg-white px-4 text-[13px] font-medium text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand"
        >
          다음
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
