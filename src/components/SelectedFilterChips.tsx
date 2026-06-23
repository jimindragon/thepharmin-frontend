"use client";

import { X } from "lucide-react";
import type { AppliedFilterChip } from "@/types/jobs";

interface SelectedFilterChipsProps {
  chips: AppliedFilterChip[];
  onRemove: (chip: AppliedFilterChip) => void;
}

export function SelectedFilterChips({ chips, onRemove }: SelectedFilterChipsProps) {
  return (
    <div className="mt-3 flex min-h-[36px] flex-wrap items-center gap-2.5">
      <span className="mr-1 text-[13px] font-medium text-[#8a94a3]">적용 조건</span>
      {chips.length === 0 ? (
        <span className="text-[13px] font-normal text-[#a0a9b7]">선택된 조건 없음</span>
      ) : (
        chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onRemove(chip)}
            className="flex h-[32px] items-center gap-2 border border-[#dddddd] bg-white px-3 text-[13px] font-medium text-[#3d3d3d] transition-colors hover:border-brand hover:bg-[#f4f4f4] hover:text-brand"
            aria-label={`${chip.label} 조건 삭제`}
          >
            {chip.label}
            <X size={14} strokeWidth={2.2} />
          </button>
        ))
      )}
    </div>
  );
}
