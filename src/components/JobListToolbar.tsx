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
      className="grid h-9 overflow-hidden border border-[#dce2ea] bg-white"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx(
            // ≤760px에서는 정렬칸이 전폭(items-stretch)이라 min-w가 필요 없다 —
            // 약국 트랙(정렬 4개)이 좁은 화면에서 잘리지 않도록 여기서만 풀어준다.
            // whitespace-nowrap이 함께 있어야 한다: min-w를 풀면 칸이 좁아져 "마감임박순"·"시급 높은순"이
            // 두 줄로 접히고, h-9 + overflow-hidden에 둘째 줄이 잘린다.
            "min-w-[104px] whitespace-nowrap border-r border-[#dce2ea] px-3.5 text-[13px] font-medium last:border-r-0 max-[760px]:min-w-0",
            sortOption === option ? "bg-[#111111] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
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
        <p className="text-[17px] font-bold text-[#3c4655]">
          총 <span className="text-brand">{totalCount}개</span> 공고
        </p>
      </div>
      <SortButtons options={sortOptions} sortOption={sortOption} onChange={onSortChange} />
    </div>
  );
}
