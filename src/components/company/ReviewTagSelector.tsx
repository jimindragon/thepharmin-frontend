"use client";

import { OptionChip } from "@/components/SearchFilterPanel";
import { getReviewTagGroups, REVIEW_TAG_MAX } from "@/config/reviewTags";
import type { CompanyReviewType, JobTrack } from "@/types/jobs";

interface ReviewTagSelectorProps {
  track: JobTrack;
  reviewType: CompanyReviewType;
  /** 현재 선택된 태그 목록 */
  selected: string[];
  onToggle: (tag: string) => void;
  /** 선택 가능한 최대 개수. 기본값 REVIEW_TAG_MAX */
  max?: number;
}

/** 기업 리뷰·면접 후기 작성 화면에서 재사용할 태그 선택 UI. OptionChip을 그대로 재사용하고 최대 선택 개수 제한만 얹는다. */
export function ReviewTagSelector({ track, reviewType, selected, onToggle, max = REVIEW_TAG_MAX }: ReviewTagSelectorProps) {
  const groups = getReviewTagGroups(track, reviewType);
  const midpoint = Math.ceil(groups.length / 2);
  const columns = [groups.slice(0, midpoint), groups.slice(midpoint)];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-[#8a95a5]">해당하는 태그를 선택해주세요</p>
        <p className="text-[12px] font-medium text-[#596373]">
          선택 {selected.length} / {max}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-[640px]:grid-cols-1">
        {columns.map((columnGroups, columnIndex) => (
          <div key={columnIndex} className="grid content-start gap-6">
            {columnGroups.map((group) => (
              <div key={group.category}>
                <p className="mb-3 text-[14px] font-semibold text-[#4a5361]">{group.category}</p>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const active = selected.includes(tag);
                    const disabled = selected.length >= max && !active;
                    return <OptionChip key={tag} option={{ id: tag, label: tag }} active={active} disabled={disabled} onClick={() => onToggle(tag)} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
