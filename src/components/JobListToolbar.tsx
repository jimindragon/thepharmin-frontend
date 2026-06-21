"use client";

import clsx from "clsx";
import type { SortOption } from "@/types/jobs";

const sortOptions: SortOption[] = ["추천순", "최신순", "마감임박순"];

interface JobListToolbarProps {
  totalCount: number;
  sortOption: SortOption;
  headhuntingOnly: boolean;
  onSortChange: (sortOption: SortOption) => void;
  onHeadhuntingOnlyChange: (checked: boolean) => void;
}

export function JobListToolbar({
  totalCount,
  sortOption,
  headhuntingOnly,
  onSortChange,
  onHeadhuntingOnlyChange,
}: JobListToolbarProps) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[15px] font-extrabold text-[#3c4655]">
          총 <span className="text-brand">{totalCount}개</span> 공고
        </p>
        <label className="inline-flex h-[32px] cursor-pointer items-center gap-2 border border-[#dfe4ea] bg-white px-3 text-[12px] font-bold text-[#4f5966] transition-colors hover:border-brand hover:text-brand">
          <input
            type="checkbox"
            checked={headhuntingOnly}
            onChange={(event) => onHeadhuntingOnlyChange(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          헤드헌팅 공고만 보기
        </label>
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
