"use client";

import clsx from "clsx";
import type { SortOption } from "@/types/jobs";

const sortOptions: SortOption[] = ["추천순", "최신순", "마감임박순"];

interface JobListToolbarProps {
  totalCount: number;
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
}

export function JobListToolbar({
  totalCount,
  sortOption,
  onSortChange,
}: JobListToolbarProps) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[15px] font-extrabold text-[#3c4655]">
          총 <span className="text-brand">{totalCount}개</span> 공고
        </p>
      </div>
      <div className="grid h-[34px] grid-cols-3 overflow-hidden rounded-[var(--radius)] border border-[#dce2ea] bg-white">
        {sortOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSortChange(option)}
            className={clsx(
              "min-w-[96px] border-r border-[#dce2ea] px-3.5 text-[12px] font-bold last:border-r-0",
              sortOption === option ? "bg-[#050505] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
