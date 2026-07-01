"use client";

import clsx from "clsx";
import type { SortOption } from "@/types/jobs";

const defaultSortOptions: SortOption[] = ["추천순", "최신순", "마감임박순"];

interface SortButtonsProps {
  options?: SortOption[];
  sortOption: SortOption;
  onChange: (sortOption: SortOption) => void;
}

export function SortButtons({ options = defaultSortOptions, sortOption, onChange }: SortButtonsProps) {
  return (
    <div
      className="grid h-[34px] overflow-hidden border border-[#dce2ea] bg-white"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx(
            "min-w-[96px] border-r border-[#dce2ea] px-3.5 text-[12px] font-medium last:border-r-0",
            sortOption === option ? "bg-[#050505] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

interface JobListToolbarProps {
  totalCount: number;
  sortOption: SortOption;
  sortOptions?: SortOption[];
  onSortChange: (sortOption: SortOption) => void;
}

export function JobListToolbar({
  totalCount,
  sortOption,
  sortOptions,
  onSortChange,
}: JobListToolbarProps) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[15px] font-semibold text-[#3c4655]">
          총 <span className="text-brand">{totalCount}개</span> 공고
        </p>
      </div>
      <SortButtons options={sortOptions} sortOption={sortOption} onChange={onSortChange} />
    </div>
  );
}
