"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, onPageChange }: PaginationProps) {
  const pages = [1, 2, 3, 4, 5];

  return (
    <nav className="mt-8 flex justify-center" aria-label="공고 목록 페이지">
      <div className="flex h-[38px] items-center">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={clsx(
              "h-[38px] w-[46px] border border-r-0 border-[#dce2ea] text-[13px] font-medium",
              currentPage === page ? "bg-[#050505] text-white" : "bg-white text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, 5))}
          className="flex h-[38px] items-center gap-2 border border-[#dce2ea] bg-white px-4 text-[13px] font-medium text-[#5c6675] hover:bg-[#f5f5f5] hover:text-brand"
        >
          다음
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
